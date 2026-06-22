import { Request, Response } from 'express';
import { securePrisma } from '../services/secure-prisma';
// import { cacheService } from '../services/cache.service';
// import { auditLogger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { UserContext } from '../services/permissions.service';
import crypto from 'crypto';
import { auditChainValid } from '../utils/metrics';

const auditLogger = { info: console.log };

const CACHE_PREFIX = 'audits';

export class AuditController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);

      const audits = await securePrisma.audit.findMany(ctx, {
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      res.json({ success: true, data: audits });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const { action, reason, status } = req.body;

      if (!action || !reason || !status) {
        throw new AppError(400, 'Champs requis: action, reason, status');
      }

      if (!['AUTHORIZED', 'BYPASS', 'RESTRICTED_ATTEMPT'].includes(status)) {
        throw new AppError(400, 'Status invalide');
      }

      const lastAudit: any = await securePrisma.audit.findFirst(ctx, {
        orderBy: { timestamp: 'desc' },
      });

      const previousHash = lastAudit?.hash ?? '0'.repeat(64);
      const logId = `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const hashInput = `${logId}|${previousHash}|${action}|${ctx.userId}|${reason}`;
      const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

      const audit: any = await securePrisma.audit.create(ctx, {
        data: {
          logId,
          userId: ctx.userId,
          userName: ctx.role,
          hotelId: ctx.hotelId,
          action,
          reason,
          previousHash,
          hash,
          status,
          timestamp: new Date(),
        }
      });

      auditLogger.info({
        action: 'AUDIT_CREATED',
        auditId: audit.id,
        actionType: action,
        status,
        userId: ctx.userId,
      });

      res.status(201).json({ success: true, data: audit });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async verify(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;

      const audits: any[] = await securePrisma.audit.findMany(ctx, {
        orderBy: { timestamp: 'asc' },
      });

      let valid = true;
      let brokenAt: number | undefined;

      for (let i = 0; i < audits.length; i++) {
        const current = audits[i];
        const expectedPrevious = i === 0 ? '0'.repeat(64) : audits[i - 1].hash;

        const hashInput = `${current.logId}|${current.previousHash}|${current.action}|${current.userId}|${current.reason}`;
        const recomputedHash = crypto.createHash('sha256').update(hashInput).digest('hex');

        if (current.hash !== recomputedHash || current.previousHash !== expectedPrevious) {
          valid = false;
          brokenAt = i;
          break;
        }
      }

      auditChainValid.set(valid ? 1 : 0);

      res.json({
        success: true,
        data: {
          valid,
          total: audits.length,
          brokenAt,
          hotelId: ctx.hotelId,
        },
      });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
