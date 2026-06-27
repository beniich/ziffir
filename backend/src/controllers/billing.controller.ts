import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';
import { prisma } from '../server';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import type { PlanKey } from '../config/stripe-plans';

export class BillingController {
  static async createCheckout(req: Request, res: Response): Promise<void> {
    try {
      const { plan } = req.body as { plan: PlanKey };
      const userId = (req as any).user.userId;

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      const session = await StripeService.createCheckoutSession(
        userId,
        plan,
        `${frontendUrl}/billing/success`,
        `${frontendUrl}/billing`,
      );

      res.json({ success: true, data: session });
    } catch (err: any) {
      const status = err.statusCode || 500;
      logger.error({ err: err.message }, 'Checkout creation failed');
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async verifySession(req: Request, res: Response): Promise<void> {
    try {
      const { session_id } = req.query;
      const userId = (req as any).user.userId;

      if (!session_id || typeof session_id !== 'string') {
        throw new AppError(400, 'session_id requis');
      }

      const result = await StripeService.verifyCheckoutSession(session_id);

      if (!result.paid) {
        res.status(402).json({ success: false, error: 'Paiement non confirmé' });
        return;
      }

      if (result.userId !== userId) {
        logger.warn({ sessionUser: result.userId, requestUser: userId }, 'Session mismatch');
        throw new AppError(403, 'Cette session ne vous appartient pas');
      }

      res.json({ success: true, data: { paid: true, plan: result.plan } });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async createPortal(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      const url = await StripeService.createPortalSession(userId, `${frontendUrl}/billing`);

      res.json({ success: true, data: { url } });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async getSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;

      const sub = await prisma.subscription.findUnique({
        where: { userId },
        include: {
          invoices: { orderBy: { createdAt: 'desc' }, take: 12 },
        },
      });

      res.json({ success: true, data: sub });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getUsage(req: Request, res: Response): Promise<void> {
    try {
      res.json({ success: true, data: { } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
