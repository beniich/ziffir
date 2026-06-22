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

const CACHE_PREFIX = 'vault';

export class VaultController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;

      const cacheKey = `${CACHE_PREFIX}:${ctx.hotelId}:${ctx.userId}`;

      const docs = await cacheService.remember(
        cacheKey,
        async () => {
          return securePrisma.vault.findMany(ctx, {
            where: { withdrawnAt: null },
            orderBy: { depositDate: 'desc' },
          });
        },
        60,
      );

      res.json({ success: true, data: docs });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const { id } = req.params;

      const doc = await securePrisma.vault.findUnique(ctx, id);
      if (!doc) throw new AppError(404, 'Document introuvable');

      res.json({ success: true, data: doc });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async deposit(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const { name, category, owner, room, fingerprint } = req.body;

      if (!name || !category || !owner || !room) {
        throw new AppError(400, 'Champs requis: name, category, owner, room');
      }

      const docRef = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const doc: any = await securePrisma.vault.create(ctx, {
        data: {
          docRef,
          name,
          category,
          owner,
          room,
          fingerprint: fingerprint ?? true,
          depositDate: new Date(),
        }
      });

      await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);

      broadcastUpdate({
        type: 'VAULT_DOC_ADDED',
        data: doc,
        hotelId: doc.hotelId,
      });

      auditLogger.info({
        action: 'VAULT_DOC_DEPOSITED',
        docId: doc.id,
        owner,
        room,
        hotelId: doc.hotelId,
        depositedBy: ctx.userId,
      });

      res.status(201).json({ success: true, data: doc });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async withdraw(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const { id } = req.params;

      const existing: any = await securePrisma.vault.findUnique(ctx, id);
      if (!existing) throw new AppError(404, 'Document introuvable');
      if (existing.withdrawnAt) throw new AppError(400, 'Document déjà retiré');

      await securePrisma.vault.update(ctx, id, {
        withdrawnAt: new Date(),
      });

      await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);

      broadcastUpdate({
        type: 'VAULT_DOC_WITHDRAWN',
        data: { id, owner: existing.owner, room: existing.room },
        hotelId: existing.hotelId,
      });

      auditLogger.info({
        action: 'VAULT_DOC_WITHDRAWN',
        docId: id,
        owner: existing.owner,
        withdrawnBy: ctx.userId,
        role: ctx.role,
      });

      res.json({ success: true, message: 'Document retiré' });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
