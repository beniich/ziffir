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

const CACHE_PREFIX = 'suite-controls';

export class ControlsController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;

      const cacheKey = `${CACHE_PREFIX}:${ctx.hotelId}`;

      const controls = await cacheService.remember(
        cacheKey,
        () => securePrisma.suiteControl.findMany(ctx, {
          orderBy: { room: { number: 'asc' } },
          include: { room: true },
        }),
        30,
      );

      res.json({ success: true, data: controls });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const { id } = req.params;
      const updates = req.body;

      const allowed: any = {};
      const ALLOWED_FIELDS = ['lights', 'climate', 'curtains', 'music', 'musicVolume', 'doNotDisturb'];
      for (const field of ALLOWED_FIELDS) {
        if (field in updates) allowed[field] = updates[field];
      }

      if (Object.keys(allowed).length === 0) {
        throw new AppError(400, 'Aucun champ valide fourni');
      }

      const existing = await securePrisma.suiteControl.findUnique(ctx, id);
      if (!existing) throw new AppError(404, 'Suite introuvable');

      await securePrisma.suiteControl.update(ctx, id, allowed);

      const updated: any = await securePrisma.suiteControl.findUnique(ctx, id);

      await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);

      broadcastUpdate({
        type: 'SUITE_CONTROL_CHANGED',
        data: updated,
        hotelId: updated.hotelId,
      });

      auditLogger.info({
        action: 'SUITE_CONTROL_UPDATED',
        controlId: id,
        changes: allowed,
        updatedBy: ctx.userId,
      });

      res.json({ success: true, data: updated });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
