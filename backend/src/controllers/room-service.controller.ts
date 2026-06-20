// src/controllers/room-service.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SanitizeService } from '../services/sanitize.service';
import { broadcastUpdate } from '../websocket/ws.server';
import type { ApiResponse, OrderStatus } from '../types';

const prisma = new PrismaClient();

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  'Preparation': 'Quality Check',
  'Quality Check': 'Out for Delivery',
  'Out for Delivery': 'Delivered',
  'Delivered': null,
};

export class RoomServiceController {
  /**
   * GET /api/room-service/menu
   */
  static async getMenu(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const menu = await prisma.course.findMany({
        where: { available: true },
        orderBy: { category: 'asc' },
      });
      res.json({ success: true, data: menu });
    } catch (error) {
      console.error('[RoomService.getMenu]', error);
      res.status(500).json({ success: false, error: 'Erreur récupération menu' });
    }
  }

  /**
   * GET /api/room-service/orders
   */
  static async getOrders(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const orders = await prisma.roomOrder.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: orders });
    } catch (error) {
      console.error('[RoomService.getOrders]', error);
      res.status(500).json({ success: false, error: 'Erreur récupération commandes' });
    }
  }

  /**
   * POST /api/room-service/orders
   */
  static async createOrder(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { roomNumber, guestName, guestVIP, items, notes, priority } = req.body;

      if (!roomNumber || !guestName || !items || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Champs requis: roomNumber, guestName, items[]',
        });
      }

      // Calcul des totaux
      let subtotal = 0;
      const orderItemsData: Array<{ courseCode: string; name: string; quantity: number; price: number }> = [];

      for (const item of items) {
        const course = await prisma.course.findUnique({ where: { code: item.courseCode } });
        if (!course) {
          return res.status(400).json({
            success: false,
            error: `Cours inconnu: ${item.courseCode}`,
          });
        }
        const quantity = item.quantity || 1;
        const lineTotal = course.price * quantity;
        subtotal += lineTotal;
        orderItemsData.push({
          courseCode: course.code,
          name: course.name,
          quantity,
          price: course.price,
        });
      }

      const vat = subtotal * 0.10;
      const serviceCharge = subtotal * 0.10;
      const total = subtotal + vat + serviceCharge;

      // Création
      const orderRef = `order-${Date.now()}`;
      const order = await prisma.roomOrder.create({
        data: {
          orderRef,
          roomNumber: SanitizeService.text(roomNumber),
          guestName: SanitizeService.text(guestName),
          guestVIP: guestVIP ?? false,
          status: 'Preparation',
          priority: priority || 'normal',
          notes: SanitizeService.textOptional(notes),
          subtotal,
          vat,
          serviceCharge,
          total,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // Notification WebSocket (cuisine)
      broadcastUpdate({
        type: 'ORDER_CREATED',
        data: order,
      });

      res.status(201).json({ success: true, data: order });
    } catch (error) {
      console.error('[RoomService.createOrder]', error);
      res.status(500).json({ success: false, error: 'Erreur création commande' });
    }
  }

  /**
   * PATCH /api/room-service/orders/:id/advance
   */
  static async advanceOrder(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { id } = req.params;
      const order = await prisma.roomOrder.findUnique({ where: { id } });

      if (!order) {
        return res.status(404).json({ success: false, error: 'Commande introuvable' });
      }

      const nextStatus = STATUS_FLOW[order.status as OrderStatus];
      if (!nextStatus) {
        return res.status(400).json({ success: false, error: 'Commande déjà livrée' });
      }

      const updated = await prisma.roomOrder.update({
        where: { id },
        data: { status: nextStatus },
        include: { items: true },
      });

      broadcastUpdate({
        type: 'ORDER_STATUS_CHANGED',
        data: updated,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('[RoomService.advanceOrder]', error);
      res.status(500).json({ success: false, error: 'Erreur avancement statut' });
    }
  }
}
