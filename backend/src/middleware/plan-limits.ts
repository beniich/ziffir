import { Request, Response, NextFunction } from 'express';
import { StripeService } from '../services/stripe.service';
import { UserContext } from '../services/permissions.service';
import { AppError } from './errorHandler';

/**
 * Middleware : bloque l'opération si la limite du plan est atteinte.
 * Usage : router.post('/rooms', requirePlanLimit('rooms'), controller.create)
 */
export const requirePlanLimit = (metric: 'rooms' | 'staff' | 'apiCalls' | 'storage') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = req.user as UserContext;
      if (!ctx.hotelId) return next();

      const result = await StripeService.checkLimit(ctx.hotelId, metric);

      if (!result.allowed) {
        res.status(402).json({
          success: false,
          error: `Limite de plan atteinte : ${result.current}/${result.limit === -1 ? '∞' : result.limit} ${metric}`,
          upgrade: true,
          currentPlan: result.plan,
          upgradeUrl: '/admin/billing',
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Track automatiquement l'usage après une réponse réussie
 */
export const trackApiUsage = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        const ctx = req.user as UserContext;
        if (ctx?.hotelId) {
          StripeService.trackUsage(ctx.hotelId, 'api_calls', 1).catch(() => {});
        }
      }
    });
    next();
  };
};
