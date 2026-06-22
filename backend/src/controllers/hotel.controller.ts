import { Request, Response } from 'express';
import { securePrisma } from '../services/secure-prisma';
// import { cacheService } from '../services/cache.service';
// import { auditLogger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { UserContext, PermissionsService } from '../services/permissions.service';

const auditLogger = { info: console.log };

export class HotelController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      PermissionsService.require(ctx, 'read', 'Hotel');

      const hotels = await securePrisma.hotel.findMany(ctx, {
        orderBy: { name: 'asc' },
      });

      res.json({ success: true, data: hotels });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      PermissionsService.require(ctx, 'create', 'Hotel');

      const { name, slug, city, address, phone } = req.body;

      if (!name || !slug) {
        throw new AppError(400, 'name et slug requis');
      }

      const existing = await securePrisma.hotel.findFirst(ctx, {
        where: { slug },
      });
      if (existing) throw new AppError(409, 'Slug déjà utilisé');

      const hotel: any = await securePrisma.hotel.create(ctx, {
        data: {
          name,
          slug,
          city,
          address,
          phone,
          isActive: true,
        }
      });

      auditLogger.info({
        action: 'HOTEL_CREATED',
        hotelId: hotel.id,
        createdBy: ctx.userId,
      });

      res.status(201).json({ success: true, data: hotel });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      PermissionsService.require(ctx, 'update', 'Hotel');

      const { id } = req.params;
      const updates = { ...req.body };

      delete updates.slug;

      await securePrisma.hotel.update(ctx, id, updates);

      const updated = await securePrisma.hotel.findUnique(ctx, id);

      auditLogger.info({
        action: 'HOTEL_UPDATED',
        hotelId: id,
        changes: Object.keys(updates),
        updatedBy: ctx.userId,
      });

      res.json({ success: true, data: updated });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      PermissionsService.require(ctx, 'delete', 'Hotel');

      const { id } = req.params;

      await securePrisma.hotel.update(ctx, id, { isActive: false });

      auditLogger.info({
        action: 'HOTEL_DEACTIVATED',
        hotelId: id,
        deactivatedBy: ctx.userId,
      });

      res.json({ success: true, message: 'Hôtel désactivé' });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
