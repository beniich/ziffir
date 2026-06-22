import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';
import { STRIPE_PLANS, PlanKey } from '../config/stripe-plans';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { UserContext } from '../services/permissions.service';

export class BillingController {
  /**
   * GET /api/billing/plans
   * Liste publique des plans
   */
  static async listPlans(_req: Request, res: Response): Promise<void> {
    try {
      const plans = Object.entries(STRIPE_PLANS).map(([key, config]) => ({
        id: key,
        name: config.name,
        monthlyPrice: config.monthlyPrice,
        limits: config.limits,
        features: config.features,
        popular: 'popular' in config ? (config as any).popular : false,
      }));

      res.json({ success: true, data: plans });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/billing/subscription
   * Subscription actuelle de l'hôtel
   */
  static async getSubscription(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as UserContext;
      const hotelId = ctx.hotelId!;

      const sub = await StripeService.getSubscription(hotelId);
      res.json({ success: true, data: sub });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/billing/usage
   * Usage actuel vs limites
   */
  static async getUsage(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as UserContext;
      const hotelId = ctx.hotelId!;

      const usage = await StripeService.getUsage(hotelId);
      res.json({ success: true, data: usage });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/billing/checkout
   * Crée une session de checkout
   */
  static async createCheckout(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as UserContext;
      const { plan } = req.body as { plan: PlanKey };
      const hotelId = ctx.hotelId!;

      if (!STRIPE_PLANS[plan]) {
        throw new AppError(400, 'Plan invalide');
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      const session = await StripeService.createCheckoutSession(
        hotelId,
        plan,
        `${frontendUrl}/admin/billing?success=true`,
        `${frontendUrl}/admin/billing?canceled=true`,
      );

      res.json({
        success: true,
        data: {
          url: session.url,
          sessionId: session.id,
        },
      });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/billing/portal
   * Crée une session du portail client Stripe
   */
  static async createPortal(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as UserContext;
      const hotelId = ctx.hotelId!;

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      const session = await StripeService.createPortalSession(
        hotelId,
        `${frontendUrl}/admin/billing`,
      );

      res.json({
        success: true,
        data: { url: session.url },
      });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/billing/invoices
   * Historique des factures
   */
  static async listInvoices(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as UserContext;
      const hotelId = ctx.hotelId!;

      const invoices = await StripeService.getInvoices(hotelId);
      res.json({ success: true, data: invoices });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/billing/cancel
   * Annulation à la fin de la période
   */
  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as UserContext;
      const hotelId = ctx.hotelId!;

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const sub = await prisma.subscription.findUnique({ where: { hotelId } });

      if (!sub?.stripeSubscriptionId) {
        throw new AppError(404, 'Aucun abonnement actif');
      }

      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      logger.info(`Subscription canceled at period end: hotelId=${hotelId} subId=${sub.stripeSubscriptionId}`);

      res.json({ success: true, message: 'Annulation programmée à la fin de la période' });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/billing/resume
   * Réactive un abonnement annulé
   */
  static async resume(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as UserContext;
      const hotelId = ctx.hotelId!;

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const sub = await prisma.subscription.findUnique({ where: { hotelId } });

      if (!sub?.stripeSubscriptionId) {
        throw new AppError(404, 'Aucun abonnement');
      }

      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      res.json({ success: true, message: 'Abonnement réactivé' });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
