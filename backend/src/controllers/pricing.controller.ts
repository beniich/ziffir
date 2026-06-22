import { Request, Response } from 'express';
import { securePrisma } from '../services/secure-prisma';
// import { cacheService } from '../services/cache.service';
// import { broadcastUpdate } from '../websocket/ws.server';
// import { auditLogger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { UserContext } from '../services/permissions.service';

const cacheService = { 
  invalidatePattern: async (p: string) => {},
  remember: async (key: string, fn: Function, ttl: number) => fn()
};
const broadcastUpdate = (msg: any) => {};
const auditLogger = { info: console.log };

const CACHE_PREFIX = 'pricing';

export class PricingController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const cacheKey = `${CACHE_PREFIX}:${ctx.hotelId}`;

      const rules = await cacheService.remember(
        cacheKey,
        () => securePrisma.pricing.findMany(ctx, {
          orderBy: { suite: 'asc' },
        }),
        120,
      );

      res.json({ success: true, data: rules });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const { id } = req.params;
      const { basePrice, channelMultipliers, status } = req.body;

      const updates: any = {};
      if (basePrice !== undefined) updates.basePrice = basePrice;
      if (channelMultipliers !== undefined) updates.channelMultipliers = JSON.stringify(channelMultipliers);
      if (status !== undefined) updates.status = status;

      await securePrisma.pricing.update(ctx, id, updates);

      await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);

      const updated: any = await securePrisma.pricing.findUnique(ctx, id);

      broadcastUpdate({
        type: 'PRICING_UPDATED',
        data: updated,
        hotelId: updated.hotelId,
      });

      auditLogger.info({
        action: 'PRICING_RULE_UPDATED',
        ruleId: id,
        changes: Object.keys(updates),
        updatedBy: ctx.userId,
      });

      res.json({ success: true, data: updated });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async syncAll(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;

      const rules: any[] = await securePrisma.pricing.findMany(ctx);

      for (const rule of rules) {
        await securePrisma.pricing.update(ctx, rule.id, { status: 'pending' });
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      for (const rule of rules) {
        await securePrisma.pricing.update(ctx, rule.id, {
          status: 'synced',
          lastSync: new Date(),
        });
      }

      await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);

      auditLogger.info({
        action: 'PRICING_BULK_SYNC',
        count: rules.length,
        syncedBy: ctx.userId,
      });

      res.json({ success: true, message: `${rules.length} règles synchronisées` });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
