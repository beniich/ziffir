/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { Request, Response } from 'express';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { asyncHandler } from '../../shared/errors/asyncHandler.js';
import { subDays, startOfDay, format, differenceInMonths } from 'date-fns';

// ── Overview KPIs ─────────────────────────────────────────────────────────────

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const today   = new Date();
  const last30  = subDays(today, 30);
  const last60  = subDays(today, 60);

  const [
    curPeriod,
    prevPeriod,
    totalLeads,
    activeSubs,
    trialingSubs,
    latestMetric,
    recentLeads,
  ] = await Promise.all([
    prisma.dailyMetric.aggregate({
      where: { date: { gte: last30 } },
      _sum: {
        leadsCreated: true,
        demosBooked: true,
        trialsStarted: true,
        paidCustomers: true,
        mrrCents: true,
        newRevenueCents: true,
        churnedRevenueCents: true,
        churnedCustomers: true,
      },
    }),
    prisma.dailyMetric.aggregate({
      where: { date: { gte: last60, lt: last30 } },
      _sum: { leadsCreated: true, mrrCents: true },
    }),
    prisma.lead.count(),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.subscription.count({ where: { status: 'trialing' } }),
    prisma.dailyMetric.findFirst({ orderBy: { date: 'desc' } }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, name: true, email: true, company: true,
        source: true, status: true, score: true, createdAt: true,
      },
    }),
  ]);

  const cur  = curPeriod._sum;
  const prev = prevPeriod._sum;

  // MRR courant = dernière entrée quotidienne ou somme des subs actives en DB
  let mrrCents = latestMetric?.mrrCents ?? 0;
  if (mrrCents === 0) {
    const PLAN_PRICES: Record<string, Record<string, number>> = {
      starter:    { monthly: 9900,  yearly: 7900 },
      pro:        { monthly: 24900, yearly: 19900 },
      enterprise: { monthly: 79900, yearly: 64900 },
    };
    const subs = await prisma.subscription.findMany({
      where: { status: { in: ['active', 'trialing'] } },
    });
    for (const s of subs) {
      const price = PLAN_PRICES[s.plan]?.[s.interval] ?? s.amountCents;
      mrrCents += s.interval === 'yearly' ? Math.round(price / 12) : price;
    }
  }

  const prevMrr      = prev.mrrCents ?? 0;
  const mrrGrowth    = prevMrr > 0 ? ((mrrCents - prevMrr) / prevMrr) * 100 : 0;
  const churnRate    = activeSubs > 0 ? ((cur.churnedCustomers ?? 0) / activeSubs) * 100 : 0;
  const totalSubs    = activeSubs + trialingSubs;
  const conversionRate = totalLeads > 0 ? (totalSubs / totalLeads) * 100 : 0;

  res.json({
    kpis: {
      mrrCents,
      arrCents: mrrCents * 12,
      mrrGrowth,
      activeCustomers: activeSubs,
      trialingCustomers: trialingSubs,
      totalLeads,
      conversionRate,
      churnRate,
    },
    period30: {
      leads:               cur.leadsCreated    ?? 0,
      demos:               cur.demosBooked     ?? 0,
      trials:              cur.trialsStarted   ?? 0,
      paid:                cur.paidCustomers   ?? 0,
      newRevenueCents:     cur.newRevenueCents ?? 0,
      churnedRevenueCents: cur.churnedRevenueCents ?? 0,
    },
    comparison30: {
      leadsChange: prev.leadsCreated
        ? (((cur.leadsCreated ?? 0) - prev.leadsCreated) / prev.leadsCreated) * 100
        : 0,
      mrrChange: prevMrr ? ((mrrCents - prevMrr) / prevMrr) * 100 : 0,
    },
    recentLeads,
  });
});

// ── Timeseries ────────────────────────────────────────────────────────────────

export const getTimeseries = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const from = subDays(new Date(), days);

  const metrics = await prisma.dailyMetric.findMany({
    where: { date: { gte: from } },
    orderBy: { date: 'asc' },
  });

  res.json({ metrics });
});

// ── Funnel ────────────────────────────────────────────────────────────────────

export const getFunnel = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const from = subDays(new Date(), days);

  const metrics = await prisma.dailyMetric.findMany({
    where: { date: { gte: from } },
  });

  const funnel = metrics.reduce(
    (acc, m) => ({
      visitors: acc.visitors + m.visitors,
      leads:    acc.leads    + m.leadsCreated,
      demos:    acc.demos    + m.demosBooked,
      trials:   acc.trials   + m.trialsStarted,
      paid:     acc.paid     + m.paidCustomers,
    }),
    { visitors: 0, leads: 0, demos: 0, trials: 0, paid: 0 }
  );

  res.json({
    funnel,
    rates: {
      visitorToLead: funnel.visitors > 0 ? (funnel.leads  / funnel.visitors) * 100 : 0,
      leadToDemo:    funnel.leads    > 0 ? (funnel.demos  / funnel.leads)    * 100 : 0,
      demoToTrial:   funnel.demos    > 0 ? (funnel.trials / funnel.demos)    * 100 : 0,
      trialToPaid:   funnel.trials   > 0 ? (funnel.paid   / funnel.trials)   * 100 : 0,
    },
  });
});

// ── Cohort retention ──────────────────────────────────────────────────────────

export const getCohorts = asyncHandler(async (_req: Request, res: Response) => {
  const subs = await prisma.subscription.findMany({
    where: { status: { in: ['active', 'canceled'] } },
    select: { createdAt: true, canceledAt: true, status: true },
  });

  const map = new Map<string, { total: number; retained: Record<number, number> }>();

  for (const sub of subs) {
    const key = format(sub.createdAt, 'yyyy-MM');
    if (!map.has(key)) map.set(key, { total: 0, retained: {} });
    const cohort = map.get(key)!;
    cohort.total++;
    const end     = sub.canceledAt ?? new Date();
    const months  = Math.min(differenceInMonths(end, sub.createdAt), 11);
    for (let m = 0; m <= months; m++) {
      cohort.retained[m] = (cohort.retained[m] ?? 0) + 1;
    }
  }

  const cohorts = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cohort, data]) => {
      const retention: Record<string, number> = {};
      for (let m = 0; m < 12; m++) {
        retention[`m${m}`] =
          data.total > 0 ? Math.round(((data.retained[m] ?? 0) / data.total) * 100) : 0;
      }
      return { cohort, size: data.total, ...retention };
    });

  res.json({ cohorts });
});

// ── CSV Export ────────────────────────────────────────────────────────────────

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(Number(req.query.days) || 90, 365);
  const from = subDays(new Date(), days);

  const [leads, subs, metrics] = await Promise.all([
    prisma.lead.findMany({
      where: { createdAt: { gte: from } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscription.findMany({
      where: { createdAt: { gte: from } },
      include: { hotel: { select: { name: true } } },
    }),
    prisma.dailyMetric.findMany({
      where: { date: { gte: from } },
      orderBy: { date: 'asc' },
    }),
  ]);

  const esc = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };

  const lines: string[] = [];
  lines.push('# Leads');
  lines.push('id,date,name,email,company,source,status,score');
  for (const l of leads) {
    lines.push([l.id, l.createdAt.toISOString(), l.name, l.email, l.company ?? '', l.source, l.status, l.score].map(esc).join(','));
  }

  lines.push('');
  lines.push('# Subscriptions');
  lines.push('id,date,hotel,plan,interval,status,amountCents');
  for (const s of subs) {
    lines.push([s.id, s.createdAt.toISOString(), s.hotel.name, s.plan, s.interval, s.status, s.amountCents].map(esc).join(','));
  }

  lines.push('');
  lines.push('# Daily Metrics');
  lines.push('date,visitors,leads,demos,trials,paid,mrr_eur,churned');
  for (const m of metrics) {
    lines.push([
      format(m.date, 'yyyy-MM-dd'),
      m.visitors, m.leadsCreated, m.demosBooked, m.trialsStarted, m.paidCustomers,
      (m.mrrCents / 100).toFixed(2),
      m.churnedCustomers,
    ].map(esc).join(','));
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="sapphire-${format(new Date(), 'yyyy-MM-dd')}.csv"`);
  res.send('\uFEFF' + lines.join('\n'));
});
