import Stripe from 'stripe';
import { prisma } from '../config/database';
import { STRIPE_PLANS, PlanKey } from '../config/stripe-plans';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY manquant');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class StripeService {
  // ════════════════════════════════════════════════════════════
  // CUSTOMER MANAGEMENT
  // ════════════════════════════════════════════════════════════

  static async ensureCustomer(hotelId: string): Promise<string> {
    const sub = await prisma.subscription.findUnique({ where: { hotelId } });
    if (sub?.stripeCustomerId) return sub.stripeCustomerId;

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new AppError(404, 'Hôtel introuvable');

    const customer = await stripe.customers.create({
      email: `billing+${hotel.slug}@zaphir.com`,
      name: hotel.name,
      metadata: { hotelId, slug: hotel.slug },
    });

    await prisma.subscription.upsert({
      where: { hotelId },
      update: { stripeCustomerId: customer.id },
      create: {
        hotelId,
        stripeCustomerId: customer.id,
        plan: 'TRIAL',
        status: 'TRIALING',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 86400_000),
        trialEndsAt: new Date(Date.now() + 14 * 86400_000),
      },
    });

    return customer.id;
  }

  // ════════════════════════════════════════════════════════════
  // CHECKOUT SESSION
  // ════════════════════════════════════════════════════════════

  static async createCheckoutSession(
    hotelId: string,
    plan: PlanKey,
    successUrl: string,
    cancelUrl: string,
  ) {
    const planConfig = STRIPE_PLANS[plan];
    if (!planConfig.priceId) {
      throw new AppError(400, 'Plan invalide (pas de prix Stripe)');
    }

    const customerId = await this.ensureCustomer(hotelId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: { hotelId, plan },
      subscription_data: {
        metadata: { hotelId, plan },
        trial_period_days: plan === 'PROFESSIONAL' ? 14 : undefined,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
    });

    return session;
  }

  // ════════════════════════════════════════════════════════════
  // CUSTOMER PORTAL
  // ════════════════════════════════════════════════════════════

  static async createPortalSession(hotelId: string, returnUrl: string) {
    const sub = await prisma.subscription.findUnique({ where: { hotelId } });
    if (!sub?.stripeCustomerId) {
      throw new AppError(404, 'Aucun abonnement actif. Souscrivez d\'abord à un plan.');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    });

    return session;
  }

  // ════════════════════════════════════════════════════════════
  // WEBHOOK HANDLERS
  // ════════════════════════════════════════════════════════════

  static async handleWebhook(event: Stripe.Event) {
    logger.info(`Stripe webhook: type=${event.type} id=${event.id}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.onSubscriptionChange(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.onSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.paid':
          await this.onInvoicePaid(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.onInvoiceFailed(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.finalized':
          await this.onInvoiceFinalized(event.data.object as Stripe.Invoice);
          break;
        default:
          logger.debug(`Unhandled webhook event: ${event.type}`);
      }
    } catch (err: any) {
      logger.error(`Webhook handler failed for ${event.type}: ${err.message}`);
      throw err;
    }
  }

  private static async onCheckoutCompleted(session: Stripe.Checkout.Session) {
    const hotelId = session.metadata?.hotelId;
    if (!hotelId) {
      logger.warn(`Checkout sans hotelId metadata: sessionId=${session.id}`);
      return;
    }

    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      await this.onSubscriptionChange(sub);
    }

    logger.info(`Checkout completed: hotelId=${hotelId} sessionId=${session.id}`);
  }

  private static async onSubscriptionChange(sub: Stripe.Subscription) {
    const hotelId = sub.metadata?.hotelId;
    if (!hotelId) {
      logger.warn(`Subscription sans hotelId metadata: subId=${sub.id}`);
      return;
    }

    const planKey = (sub.metadata?.plan || 'STARTER') as PlanKey;
    const statusMap: Record<string, string> = {
      active: 'ACTIVE',
      trialing: 'TRIALING',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'CANCELED',
      unpaid: 'PAST_DUE',
      paused: 'PAST_DUE',
    };

    // Stripe v2025: current_period uses billing_cycle_anchor + items billing
    const periodStart = new Date((sub as any).current_period_start
      ? (sub as any).current_period_start * 1000
      : Date.now());
    const periodEnd = new Date((sub as any).current_period_end
      ? (sub as any).current_period_end * 1000
      : Date.now() + 30 * 86400_000);

    await prisma.subscription.upsert({
      where: { hotelId },
      update: {
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0]?.price.id,
        plan: planKey,
        status: (statusMap[sub.status] || 'INCOMPLETE') as any,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      },
      create: {
        hotelId,
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0]?.price.id,
        stripeCustomerId: sub.customer as string,
        plan: planKey,
        status: (statusMap[sub.status] || 'INCOMPLETE') as any,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      },
    });

    logger.info(`Subscription synced: hotelId=${hotelId} plan=${planKey} status=${sub.status}`);
  }

  private static async onSubscriptionDeleted(sub: Stripe.Subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });
  }

  private static async onInvoicePaid(invoice: Stripe.Invoice) {
    const stripeSubId = (invoice as any).subscription as string | undefined;
    if (!stripeSubId) return;
    const localSub = await this.findLocalSub(stripeSubId);
    if (!localSub) return;

    await prisma.invoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      update: {
        status: 'PAID',
        paidAt: new Date(),
        pdfUrl: invoice.invoice_pdf ?? undefined,
      },
      create: {
        stripeInvoiceId: invoice.id,
        subscriptionId: localSub.id,
        number: invoice.number || `INV-${Date.now()}`,
        amount: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency,
        status: 'PAID',
        paidAt: new Date(),
        pdfUrl: invoice.invoice_pdf ?? undefined,
        lineItems: (invoice.lines?.data || []) as any,
        dueAt: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      },
    });
  }

  private static async onInvoiceFailed(invoice: Stripe.Invoice) {
    await prisma.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: { status: 'OPEN' },
    });
  }

  private static async onInvoiceFinalized(invoice: Stripe.Invoice) {
    const stripeSubId = (invoice as any).subscription as string | undefined;
    if (!stripeSubId) return;
    const localSub = await this.findLocalSub(stripeSubId);
    if (!localSub) return;

    await prisma.invoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      update: {
        number: invoice.number || `INV-${Date.now()}`,
        pdfUrl: invoice.invoice_pdf ?? undefined,
        status: 'OPEN',
      },
      create: {
        stripeInvoiceId: invoice.id,
        subscriptionId: localSub.id,
        number: invoice.number || `INV-${Date.now()}`,
        amount: (invoice.amount_due || 0) / 100,
        currency: invoice.currency,
        status: 'OPEN',
        lineItems: (invoice.lines?.data || []) as any,
        dueAt: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
        pdfUrl: invoice.invoice_pdf ?? undefined,
      },
    });
  }

  private static async findLocalSub(stripeSubId: string) {
    return prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubId },
      select: { id: true, hotelId: true },
    });
  }

  // ════════════════════════════════════════════════════════════
  // LIMIT ENFORCEMENT
  // ════════════════════════════════════════════════════════════

  static async checkLimit(
    hotelId: string,
    metric: 'rooms' | 'staff' | 'apiCalls' | 'storage',
  ): Promise<{ allowed: boolean; current: number; limit: number; plan: string }> {
    const sub = await prisma.subscription.findUnique({
      where: { hotelId },
      include: {
        usage: { where: { period: this.getCurrentPeriod() } },
      },
    });

    if (!sub) {
      return { allowed: false, current: 0, limit: 0, plan: 'NONE' };
    }

    const plan = STRIPE_PLANS[sub.plan];
    const limitKey = metric === 'apiCalls' ? 'apiCallsPerMonth' : metric;
    const limit = plan.limits[limitKey as keyof typeof plan.limits] as number;

    if (limit === -1) {
      return { allowed: true, current: 0, limit: -1, plan: sub.plan };
    }

    let current = 0;
    switch (metric) {
      case 'rooms':
        current = await prisma.room.count({ where: { hotelId } });
        break;
      case 'staff':
        current = await prisma.staffMember.count({ where: { hotelId, active: true } });
        break;
      case 'apiCalls': {
        const apiUsage = sub.usage.find((u) => u.metric === 'api_calls');
        current = apiUsage?.value || 0;
        break;
      }
      case 'storage': {
        const storageUsage = sub.usage.find((u) => u.metric === 'storage_gb');
        current = storageUsage?.value || 0;
        break;
      }
    }

    return { allowed: current < limit, current, limit, plan: sub.plan };
  }

  static async trackUsage(
    hotelId: string,
    metric: 'api_calls' | 'rooms' | 'staff' | 'storage_gb',
    value: number = 1,
  ) {
    const sub = await prisma.subscription.findUnique({ where: { hotelId } });
    if (!sub) return;

    await prisma.usageRecord.create({
      data: {
        subscriptionId: sub.id,
        metric,
        value,
        period: this.getCurrentPeriod(),
      },
    });
  }

  static async hasFeature(hotelId: string, feature: string): Promise<boolean> {
    const sub = await prisma.subscription.findUnique({ where: { hotelId } });
    if (!sub) return false;
    const plan = STRIPE_PLANS[sub.plan];
    return plan.features.some((f) => f.toLowerCase().includes(feature.toLowerCase()));
  }

  private static getCurrentPeriod(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // ════════════════════════════════════════════════════════════
  // QUERIES
  // ════════════════════════════════════════════════════════════

  static async getSubscription(hotelId: string) {
    return prisma.subscription.findUnique({
      where: { hotelId },
      include: {
        invoices: { orderBy: { createdAt: 'desc' }, take: 12 },
      },
    });
  }

  static async getInvoices(hotelId: string, limit: number = 20) {
    const sub = await prisma.subscription.findUnique({ where: { hotelId } });
    if (!sub) return [];
    return prisma.invoice.findMany({
      where: { subscriptionId: sub.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async getUsage(hotelId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { hotelId },
      include: { usage: { where: { period: this.getCurrentPeriod() } } },
    });
    if (!sub) return null;

    const plan = STRIPE_PLANS[sub.plan];
    return {
      plan: sub.plan,
      status: sub.status,
      limits: plan.limits,
      current: {
        rooms: await prisma.room.count({ where: { hotelId } }),
        staff: await prisma.staffMember.count({ where: { hotelId, active: true } }),
        apiCalls: sub.usage.find((u) => u.metric === 'api_calls')?.value || 0,
        storageGb: sub.usage.find((u) => u.metric === 'storage_gb')?.value || 0,
      },
    };
  }
}
