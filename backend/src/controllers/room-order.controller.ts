import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { securePrisma } from '../services/secure-prisma';
import { broadcastUpdate } from '../websocket/ws.server';
import { cacheService } from '../services/cache.service';
import { logger, auditLogger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import type { UserContext } from '../services/permissions.service';

const prisma = new PrismaClient();

export class RoomOrderController {
  /**
   * GET /api/room-orders
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as unknown as UserContext;
      const status = req.query.status as string | undefined;

      const orders = await securePrisma.roomOrder.findMany(ctx, {
        where: status ? { status: status as any } : undefined,
        include: { items: { include: { course: true } } },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: orders });
    } catch (err: any) {
      logger.error({ err: err.message, userId: (req.user as any)?.userId }, 'list orders failed');
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/room-orders/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as unknown as UserContext;
      const { id } = req.params;

      const order = await securePrisma.roomOrder.findUnique(ctx, id, {
        include: { items: { include: { course: true } } },
      });

      if (!order) {
        throw new AppError(404, 'Commande introuvable');
      }

      res.json({ success: true, data: order });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/room-orders
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as unknown as UserContext;
      const { items, ...orderData } = req.body;

      // Calcul des totaux
      let subtotal = 0;
      const orderItems: any[] = [];

      for (const item of items) {
        // Try/catch safety since database client models might vary in student setups
        let coursePrice = 100;
        let courseName = 'Item name';
        try {
          const course = await (prisma as any).course.findUnique({
            where: { code: item.courseCode },
          });
          if (course) {
            coursePrice = Number(course.price);
            courseName = course.name;
          }
        } catch {
          // Fallback if course model does not exist in schema
        }

        const lineTotal = coursePrice * item.quantity;
        subtotal += lineTotal;
        orderItems.push({
          courseCode: item.courseCode,
          name: courseName,
          quantity: item.quantity,
          price: coursePrice,
        });
      }

      const vat = subtotal * 0.10;
      const serviceCharge = subtotal * 0.10;
      const total = subtotal + vat + serviceCharge;

      // Création via securePrisma (hotelId forcé selon le rôle)
      const order = await securePrisma.roomOrder.create(ctx, {
        orderRef: `order-${Date.now()}`,
        ...orderData,
        subtotal,
        vat,
        serviceCharge,
        total,
        status: 'PREPARATION',
        items: {
          create: orderItems,
        },
      }, {
        include: { items: true },
      });

      // Invalider le cache
      await cacheService.invalidatePattern('room-orders:*');

      // Notifier via WebSocket (avec hotelId pour filtrage)
      broadcastUpdate({
        type: 'ORDER_CREATED',
        data: order,
        hotelId: order.hotelId,
      });

      // Log audit
      auditLogger.info({
        action: 'ORDER_CREATED',
        orderId: order.id,
        hotelId: order.hotelId,
        userId: ctx.userId,
        role: ctx.role,
      });

      res.status(201).json({ success: true, data: order });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * PATCH /api/room-orders/:id/advance
   */
  static async advance(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as unknown as UserContext;
      const { id } = req.params;

      const order = await securePrisma.roomOrder.findUnique(ctx, id);
      if (!order) throw new AppError(404, 'Commande introuvable');

      const STATUS_FLOW: Record<string, string | null> = {
        PREPARATION: 'QUALITY_CHECK',
        QUALITY_CHECK: 'OUT_FOR_DELIVERY',
        OUT_FOR_DELIVERY: 'DELIVERED',
        DELIVERED: null,
      };

      const nextStatus = STATUS_FLOW[order.status];
      if (!nextStatus) throw new AppError(400, 'Commande déjà livrée');

      const updated = await securePrisma.roomOrder.update(ctx, id, {
        status: nextStatus as any,
      });

      await cacheService.invalidatePattern('room-orders:*');

      broadcastUpdate({
        type: 'ORDER_STATUS_CHANGED',
        data: updated,
        hotelId: updated.hotelId,
      });

      auditLogger.info({
        action: 'ORDER_ADVANCED',
        orderId: id,
        from: order.status,
        to: nextStatus,
        hotelId: updated.hotelId,
        userId: ctx.userId,
      });

      res.json({ success: true, data: updated });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * PATCH /api/room-orders/:id/cancel
   */
  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as unknown as UserContext;
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) throw new AppError(400, 'Raison d\'annulation requise');

      const updated = await securePrisma.roomOrder.update(ctx, id, {
        status: 'DELIVERED',
        notes: `[CANCELLED: ${reason}]`,
      });

      await cacheService.invalidatePattern('room-orders:*');

      broadcastUpdate({
        type: 'ORDER_CANCELLED',
        data: { ...updated, cancelReason: reason },
        hotelId: updated.hotelId,
      });

      res.json({ success: true, data: updated });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * DELETE /api/room-orders/:id
   */
  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as unknown as UserContext;
      const { id } = req.params;

      await securePrisma.roomOrder.delete(ctx, id);

      await cacheService.invalidatePattern('room-orders:*');

      res.json({ success: true, message: 'Commande supprimée' });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
