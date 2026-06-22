import { Request, Response } from 'express';
import { securePrisma } from '../services/secure-prisma';
// import { auditLogger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { UserContext, PermissionsService } from '../services/permissions.service';

const auditLogger = { info: console.log };

export class UserController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      PermissionsService.require(ctx, 'read', 'User');

      const { role, hotelId, search } = req.query;

      const users = await securePrisma.user.findMany(ctx, {
        where: {
          ...(role && { role: role as any }),
          ...(hotelId && { hotelId: hotelId as string }),
          ...(search && {
            OR: [
              { email: { contains: search as string, mode: 'insensitive' } },
              { username: { contains: search as string, mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: { createdAt: 'desc' },
      });

      const safe = users.map(({ passwordHash, refreshToken, failedAttempts, lockedUntil, ...u }: any) => u);

      res.json({ success: true, data: safe });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      PermissionsService.require(ctx, 'update', 'User');

      const { id } = req.params;
      const updates = { ...req.body };

      delete updates.passwordHash;
      delete updates.refreshToken;

      await securePrisma.user.update(ctx, id, updates);

      auditLogger.info({
        action: 'USER_UPDATED',
        userId: id,
        changes: Object.keys(updates),
        updatedBy: ctx.userId,
      });

      res.json({ success: true, message: 'Utilisateur mis à jour' });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      PermissionsService.require(ctx, 'delete', 'User');

      const { id } = req.params;

      await securePrisma.user.update(ctx, id, {
        isActive: false,
        refreshToken: null,
      });

      auditLogger.info({
        action: 'USER_DEACTIVATED',
        userId: id,
        deactivatedBy: ctx.userId,
      });

      res.json({ success: true, message: 'Utilisateur désactivé' });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
