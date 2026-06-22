import { Request, Response } from 'express';
import { securePrisma } from '../services/secure-prisma';
// import { cacheService } from '../services/cache.service';
// import { broadcastUpdate } from '../websocket/ws.server';
// import { auditLogger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { UserContext } from '../services/permissions.service';
import bcrypt from 'bcryptjs';

const cacheService = { invalidatePattern: async (p: string) => {} };
const broadcastUpdate = (msg: any) => {};
const auditLogger = { info: console.log };

const CACHE_PREFIX = 'staff';

export class StaffController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;

      const staff = await securePrisma.staff.findMany(ctx, {
        orderBy: { name: 'asc' },
      });

      const safe = staff.map(({ passwordHash, ...s }: any) => s);

      res.json({ success: true, data: safe });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const { id } = req.params;

      const member = await securePrisma.staff.findUnique(ctx, id);
      if (!member) throw new AppError(404, 'Membre introuvable');

      const { passwordHash, ...safe } = member as any;
      res.json({ success: true, data: safe });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const { name, email, username, password, role, department, clearanceLevel } = req.body;

      if (!name || !email || !username || !password) {
        throw new AppError(400, 'Champs requis: name, email, username, password');
      }

      const existing = await securePrisma.user.findFirst(ctx, {
        where: { OR: [{ email }, { username }] },
      });
      if (existing) throw new AppError(409, 'Email ou username déjà utilisé');

      const passwordHash = await bcrypt.hash(password, 12);

      const member: any = await securePrisma.user.create(ctx, {
        data: {
          email,
          username,
          passwordHash,
          name,
          role: 'HOTEL',
          department,
          clearanceLevel: clearanceLevel || 1,
        }
      });

      const { passwordHash: _, ...safe } = member;

      await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);

      broadcastUpdate({
        type: 'STAFF_CREATED',
        data: safe,
        hotelId: member.hotelId,
      });

      auditLogger.info({
        action: 'STAFF_CREATED',
        staffId: member.id,
        hotelId: member.hotelId,
        createdBy: ctx.userId,
      });

      res.status(201).json({ success: true, data: safe });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const { id } = req.params;
      const updates = { ...req.body };

      delete updates.passwordHash;
      delete updates.hotelId;

      await securePrisma.staff.update(ctx, id, updates);

      const updated: any = await securePrisma.staff.findUnique(ctx, id);
      const { passwordHash, ...safe } = updated;

      await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);

      auditLogger.info({
        action: 'STAFF_UPDATED',
        staffId: id,
        hotelId: updated.hotelId,
        updatedBy: ctx.userId,
      });

      res.json({ success: true, data: safe });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async updateClearance(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const { id } = req.params;
      const { clearanceLevel } = req.body;

      if (!clearanceLevel || clearanceLevel < 1 || clearanceLevel > 5) {
        throw new AppError(400, 'clearanceLevel entre 1 et 5');
      }

      await securePrisma.staff.update(ctx, id, { clearanceLevel });

      auditLogger.info({
        action: 'STAFF_CLEARANCE_CHANGED',
        staffId: id,
        newLevel: clearanceLevel,
        changedBy: ctx.userId,
        role: ctx.role,
      });

      res.json({ success: true, message: 'Clearance mise à jour' });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const { id } = req.params;

      await securePrisma.staff.update(ctx, id, { active: false });

      auditLogger.info({
        action: 'STAFF_DEACTIVATED',
        staffId: id,
        deactivatedBy: ctx.userId,
      });

      res.json({ success: true, message: 'Membre désactivé' });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
