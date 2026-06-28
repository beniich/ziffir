import { prisma } from '../infrastructure/database/prisma.client.js';
import { startOfDay, subDays, format } from 'date-fns';

// Prix mensuels normalisés par plan (en centimes)
const PLAN_PRICES: Record<string, Record<string, number>> = {
  starter:    { monthly: 9900,  yearly: Math.round(79 * 12 * 100 / 12) }, // 9900 = 99€/m
  pro:        { monthly: 24900, yearly: Math.round(199 * 12 * 100 / 12) },
  enterprise: { monthly: 79900, yearly: Math.round(649 * 12 * 100 / 12) },
};

type EventInput = {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  hotelId?: string;
  leadId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

// Buffer in-memory pour batch inserts
const eventsBuffer: EventInput[] = [];
const FLUSH_INTERVAL_MS = 5000;
const FLUSH_BATCH_SIZE  = 500;

export function trackEvent(event: EventInput) {
  eventsBuffer.push(event);

  // Forward to PostHog en prod
  if (process.env.NODE_ENV === 'production' && process.env.POSTHOG_API_KEY) {
    fetch('https://app.posthog.com/capture/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.POSTHOG_API_KEY,
        event: event.name,
        properties: event.properties,
        distinct_id: event.userId ?? event.sessionId ?? event.ip ?? 'anonymous',
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }

  if (process.env.NODE_ENV !== 'test') {
    console.log(`📊 Event: ${event.name}`, event.properties ?? {});
  }
}

// Flush périodique vers la DB
setInterval(async () => {
  if (eventsBuffer.length === 0) return;
  const batch = eventsBuffer.splice(0, FLUSH_BATCH_SIZE);
  try {
    await prisma.event.createMany({
      data: batch.map((e) => ({
        ...e,
        properties: e.properties ? JSON.stringify(e.properties) : undefined,
      })),
    });
  } catch (err) {
    console.error('[Events] flush failed, re-queueing:', err);
    eventsBuffer.unshift(...batch);
  }
}, FLUSH_INTERVAL_MS);

export async function getRecentEvents(limit = 100) {
  const rows = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map((r) => ({
    ...r,
    properties: r.properties ? JSON.parse(r.properties) : undefined,
  }));
}

/**
 * Calcule et persist les métriques quotidiennes.
 * En mode mock (pas de vraie clé Stripe), on lit directement amountCents depuis la DB.
 */
export async function computeDailyMetrics(targetDate?: Date) {
  const date  = startOfDay(targetDate ?? new Date());
  const start = date;
  const end   = new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1);

  const isStripeMock =
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_MOCK_MODE === 'true';

  // ── Funnel counts ─────────────────────────────────────────────────────────
  const [visitors, leadsCreated, demosBooked, trialsStarted, paidCustomers, churnedCustomers] =
    await Promise.all([
      prisma.event
        .findMany({
          where: { name: 'page_view', createdAt: { gte: start, lte: end } },
          select: { sessionId: true },
          distinct: ['sessionId'],
        })
        .then((r) => r.length),
      prisma.lead.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.lead.count({
        where: { source: 'demo_request', createdAt: { gte: start, lte: end } },
      }),
      prisma.subscription.count({
        where: { status: 'trialing', createdAt: { gte: start, lte: end } },
      }),
      prisma.subscription.count({
        where: { status: 'active', createdAt: { gte: start, lte: end } },
      }),
      prisma.subscription.count({
        where: { status: 'canceled', canceledAt: { gte: start, lte: end } },
      }),
    ]);

  // ── MRR courant ────────────────────────────────────────────────────────────
  const activeSubs = await prisma.subscription.findMany({
    where: { status: { in: ['active', 'trialing'] } },
  });

  let mrrCents = 0;

  if (isStripeMock) {
    // Mode dev : mapping local
    for (const sub of activeSubs) {
      const price = PLAN_PRICES[sub.plan]?.[sub.interval] ?? sub.amountCents;
      const monthlyCents = sub.interval === 'yearly' ? Math.round(price / 12) : price;
      mrrCents += monthlyCents;
    }
  } else {
    // Prod : lecture depuis Stripe (chargée dynamiquement pour éviter d'importer Stripe en mock)
    const { stripe } = await import('./stripe.service.js' as any);
    for (const sub of activeSubs) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
        const item     = stripeSub.items.data[0];
        if (!item) continue;
        const amount   = item.price.unit_amount ?? 0;
        const interval = item.price.recurring?.interval;
        mrrCents += interval === 'year' ? Math.round(amount / 12) : amount;
      } catch {
        // Fallback DB si Stripe indispo
        mrrCents += sub.amountCents;
      }
    }
  }

  // ── New / Churned revenue ce jour ──────────────────────────────────────────
  const [newSubs, churnedSubs] = await Promise.all([
    prisma.subscription.findMany({
      where: { status: 'active', createdAt: { gte: start, lte: end } },
    }),
    prisma.subscription.findMany({
      where: { canceledAt: { gte: start, lte: end } },
    }),
  ]);

  const newRevenueCents     = newSubs.reduce((acc, s) => acc + s.amountCents, 0);
  const churnedRevenueCents = churnedSubs.reduce((acc, s) => acc + s.amountCents, 0);

  await prisma.dailyMetric.upsert({
    where: { date: start },
    create: {
      date: start,
      visitors,
      leadsCreated,
      demosBooked,
      trialsStarted,
      paidCustomers,
      churnedCustomers,
      mrrCents,
      arrCents: mrrCents * 12,
      newRevenueCents,
      churnedRevenueCents,
    },
    update: {
      visitors,
      leadsCreated,
      demosBooked,
      trialsStarted,
      paidCustomers,
      churnedCustomers,
      mrrCents,
      arrCents: mrrCents * 12,
      newRevenueCents,
      churnedRevenueCents,
    },
  });

  console.log(
    `📊 Metrics ${format(date, 'yyyy-MM-dd')}: leads=${leadsCreated} MRR=${(mrrCents / 100).toFixed(0)}€`
  );
}

/**
 * Nettoie les WebhookLogs > 30 jours.
 */
export async function cleanupOldWebhookLogs() {
  const cutoff = subDays(new Date(), 30);
  const { count } = await prisma.webhookLog.deleteMany({
    where: { sentAt: { lt: cutoff } },
  });
  if (count > 0) console.log(`🗑️  Cleaned ${count} old webhook logs`);
}
