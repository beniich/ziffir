import Stripe from 'stripe';
import { prisma } from '../server';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { STRIPE_PLANS, PlanKey } from '../config/stripe-plans';
import type { PlanKey as DbPlanKey } from '@prisma/client';

if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn({}, 'STRIPE_SECRET_KEY manquant - Veuillez configurer cette variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10',
  typescript: true,
  maxNetworkRetries: 2,
  timeout: 10_000,
});

export class StripeService {
  /**
   * Crée ou récupère le Customer Stripe pour un utilisateur.
   */
  static async ensureCustomer(userId: string, email: string, name: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    logger.info({ userId, customerId: customer.id }, 'Stripe customer created');
    return customer.id;
  }

  /**
   * Crée une Checkout Session pour un plan payant.
   */
  static async createCheckoutSession(
    userId: string,
    plan: PlanKey,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string; sessionId: string }> {
    const planConfig = STRIPE_PLANS[plan];

    if (plan === 'FREE' || !planConfig.priceId) {
      throw new AppError(400, 'Le plan Free ne nécessite pas de paiement');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'Utilisateur introuvable');

    const customerId = await this.ensureCustomer(userId, user.email, user.username);

    const existingActive = await prisma.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'TRIALING'] } },
    });

    if (existingActive) {
      throw new AppError(409, 'Vous avez déjà un abonnement actif. Utilisez le Customer Portal pour le modifier.');
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,

      metadata: {
        userId,
        plan,
      },

      subscription_data: {
        metadata: {
          userId,
          plan,
        },
        trial_period_days: ['PREMIUM', 'PLATINIUM'].includes(plan) ? 14 : undefined,
      },

      allow_promotion_codes: true,
      billing_address_collection: 'required',

      locale: 'fr',
      payment_method_types: ['card'],
    });

    if (!session.url) {
      throw new AppError(500, 'Stripe n\'a pas retourné d\'URL');
    }

    logger.info({ userId, plan, sessionId: session.id }, 'Checkout session created');
    return { url: session.url, sessionId: session.id };
  }

  /**
   * Vérifie une Checkout Session directement via Stripe API.
   */
  static async verifyCheckoutSession(sessionId: string): Promise<{
    paid: boolean;
    userId?: string;
    plan?: PlanKey;
  }> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return { paid: false };
      }

      return {
        paid: true,
        userId: session.metadata?.userId,
        plan: session.metadata?.plan as PlanKey | undefined,
      };
    } catch (err: any) {
      logger.error({ err: err.message, sessionId }, 'Failed to verify checkout session');
      return { paid: false };
    }
  }

  /**
   * Crée une session du portail client Stripe.
   */
  static async createPortalSession(userId: string, returnUrl: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) {
      throw new AppError(404, 'Aucun abonnement Stripe associé. Souscrivez d\'abord à un plan payant.');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  /**
   * Point d'entrée principal des webhooks Stripe.
   */
  static async handleWebhook(event: Stripe.Event): Promise<void> {
    logger.info({ type: event.type, id: event.id }, 'Stripe webhook received');

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'invoice.payment_succeeded':
          await this.onInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.onInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.onSubscriptionChange(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.onSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        default:
          logger.debug({ type: event.type }, 'Unhandled webhook event');
      }
    } catch (err: any) {
      logger.error({ err: err.message, eventType: event.type }, 'Webhook handler failed');
      throw err;
    }
  }

  private static async onCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) {
      logger.warn({ sessionId: session.id }, 'Checkout sans userId metadata');
      return;
    }

    if (!session.subscription) {
      logger.warn({ sessionId: session.id }, 'Checkout sans subscription');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await this.onSubscriptionChange(subscription);
  }

  private static async onInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;

    const stripeSubId = invoice.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(stripeSubId);
    await this.onSubscriptionChange(subscription);
  }

  private static async onInvoicePaymentFailed(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: { status: 'PAST_DUE' },
    });

    logger.warn({ invoiceId: invoice.id }, 'Subscription payment failed');
  }

  private static async onSubscriptionChange(sub: Stripe.Subscription) {
    const userId = sub.metadata?.userId;
    if (!userId) {
      logger.warn({ subId: sub.id }, 'Subscription sans userId metadata');
      return;
    }

    const planKey = (sub.metadata?.plan || 'PREMIUM') as PlanKey;

    const statusMap: Record<string, any> = {
      active: 'ACTIVE',
      trialing: 'TRIALING',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'CANCELED',
      unpaid: 'PAST_DUE',
      paused: 'PAUSED',
    };

    const dbStatus = statusMap[sub.status] || 'INCOMPLETE';

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: sub.customer as string,
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0]?.price.id || '',
        stripeProductId: sub.items.data[0]?.price.product as string,
        plan: planKey as DbPlanKey,
        status: dbStatus,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
        trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : null,
        trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      },
      update: {
        stripePriceId: sub.items.data[0]?.price.id || '',
        stripeProductId: sub.items.data[0]?.price.product as string,
        plan: planKey as DbPlanKey,
        status: dbStatus,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
        trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: sub.id,
        subscriptionStatus: dbStatus,
        stripePriceId: sub.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
      },
    });

    logger.info({
      userId,
      plan: planKey,
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
    }, 'Subscription synced');
  }

  private static async onSubscriptionDeleted(sub: Stripe.Subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });

    await prisma.user.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { subscriptionStatus: 'CANCELED' },
    });

    logger.info({ subId: sub.id }, 'Subscription canceled');
  }
}
