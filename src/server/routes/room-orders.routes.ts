// src/server/routes/room-orders.routes.ts
// ============================================================================
// Room Orders API — workflow multi-rôles + temps réel + audit hash chain
// Statuts : PENDING → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
// ============================================================================

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auditService } from '../domains/shared/services/audit.service.js';
import { getRealtimeServer } from '../realtime/socketServer.js';
import { pushNotificationService } from '../services/push-notification.service.js';
import { eventBus } from '../core/eventBus.js';

const router = Router();
const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// Workflow : transitions autorisées
// ----------------------------------------------------------------------------
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING:          ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED:        ['PREPARING', 'CANCELLED'],
  PREPARING:        ['READY', 'CANCELLED'],
  READY:            ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED:        [],
  CANCELLED:        [],
  REJECTED:         [],
};

// Timestamps à appliquer automatiquement selon la transition
const STATUS_TIMESTAMPS: Record<string, string> = {
  CONFIRMED:        'acknowledgedAt',
  PREPARING:        'startedPrepAt',
  READY:            'readyAt',
  DELIVERED:        'deliveredAt',
};

function getTenantId(req: Request): string {
  const auth = (req as any).auth;
  return auth?.hotelId || auth?.tenantId || 'hotel-dev';
}

function getActorId(req: Request): string {
  const auth = (req as any).auth;
  return auth?.uid || auth?.sub || 'system';
}

function getActorRole(req: Request): string {
  const auth = (req as any).auth;
  return (auth?.role || 'hotel').toLowerCase();
}

// Génère un numéro de commande RS-YYYY-MM-NNNN
async function generateOrderNumber(hotelId: string): Promise<string> {
  const now = new Date();
  const prefix = `RS-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.roomOrder.count({
    where: {
      hotelId,
      placedAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
    },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// ----------------------------------------------------------------------------
// GET /api/room-orders — liste avec filtres
// ?status=PENDING,CONFIRMED  &roomId=xxx  &assignedToMe=true
// ----------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const hotelId = getTenantId(req);
    const actorId = getActorId(req);
    const actorRole = getActorRole(req);
    const { status, roomId, assignedToMe } = req.query as Record<string, string>;

    const where: any = { hotelId };

    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    } else {
      // Défaut : commandes actives
      where.status = { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] };
    }

    if (roomId) where.roomId = roomId;

    if (assignedToMe === 'true') {
      if (actorRole === 'client') {
        where.guestId = actorId;
      } else {
        where.OR = [{ assignedChefId: actorId }, { assignedServerId: actorId }];
      }
    } else if (actorRole === 'client') {
      // Un client ne voit que ses propres commandes
      where.guestId = actorId;
    }

    const orders = await prisma.roomOrder.findMany({
      where,
      include: {
        room: { select: { id: true, number: true, floor: true } },
        items: true,
        assignedChef: { select: { id: true, displayName: true } },
        assignedServer: { select: { id: true, displayName: true } },
      },
      orderBy: { placedAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: orders });
  } catch (e) {
    console.error('[room-orders] GET / error', e);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ----------------------------------------------------------------------------
// GET /api/room-orders/:id — détail avec historique
// ----------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const hotelId = getTenantId(req);
    const actorId = getActorId(req);
    const actorRole = getActorRole(req);

    const order = await prisma.roomOrder.findFirst({
      where: { id: String(req.params.id), hotelId: String(hotelId) },
      include: {
        room: true,
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 20 },
        placedBy: { select: { displayName: true, email: true } },
        assignedChef: { select: { id: true, displayName: true } },
        assignedServer: { select: { id: true, displayName: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Commande introuvable' } });
    }

    // RBAC : un client ne voit que ses propres commandes
    if (actorRole === 'client' && order.guestId !== actorId) {
      return res.status(403).json({ success: false, error: { message: 'Accès refusé' } });
    }

    res.json({ success: true, data: order });
  } catch (e) {
    console.error('[room-orders] GET /:id error', e);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ----------------------------------------------------------------------------
// POST /api/room-orders — créer une commande
// ----------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const hotelId = getTenantId(req);
    const actorId = getActorId(req);
    const actorRole = getActorRole(req);
    const { roomId, guestName, guestNotes, items, source } = req.body;

    if (!roomId || !guestName || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Données requises manquantes' } });
    }

    // Récupération des plats avec vérification de disponibilité
    const menuItemIds = items.map((i: any) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, hotelId },
    });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ success: false, error: { message: 'Plat(s) introuvable(s)' } });
    }

    const unavailable = menuItems.filter((m: any) => !m.isAvailable);
    if (unavailable.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          message: `Plats indisponibles : ${unavailable.map((m: any) => m.name).join(', ')}`,
          code: 'ITEMS_UNAVAILABLE',
        },
      });
    }

    // Calcul des totaux
    let subtotalCents = 0;
    let maxPrepMinutes = 0;
    const orderItemsData = items.map((item: any) => {
      const menuItem = menuItems.find((m: any) => m.id === item.menuItemId)!;
      const lineTotal = menuItem.priceCents * item.quantity;
      subtotalCents += lineTotal;
      maxPrepMinutes = Math.max(maxPrepMinutes, menuItem.prepMinutes);
      return {
        menuItemId: item.menuItemId,
        nameSnapshot: menuItem.name,
        priceCentsSnapshot: menuItem.priceCents,
        prepMinutesSnapshot: menuItem.prepMinutes,
        quantity: item.quantity,
        customizations: item.customizations ? JSON.stringify(item.customizations) : null,
        itemNotes: item.itemNotes || null,
        unitPriceCents: menuItem.priceCents,
        totalPriceCents: lineTotal,
      };
    });

    const serviceFeeCents = Math.round(subtotalCents * 0.10);
    const taxCents = Math.round((subtotalCents + serviceFeeCents) * 0.10);
    const totalCents = subtotalCents + serviceFeeCents + taxCents;
    const estimatedReadyAt = new Date(Date.now() + (maxPrepMinutes + 10) * 60_000);
    const orderNumber = await generateOrderNumber(hotelId);

    // Création transactionnelle
    const order = await prisma.roomOrder.create({
      data: {
        hotelId,
        roomId,
        orderNumber,
        guestName,
        guestId: actorRole === 'client' ? actorId : null,
        placedById: actorId,
        placedBySource: source || 'GUEST_PORTAL',
        status: 'PENDING',
        guestNotes: guestNotes || null,
        subtotalCents,
        serviceFeeCents,
        taxCents,
        totalCents,
        currency: menuItems[0]?.currency || 'EUR',
        estimatedReadyAt,
        items: { create: orderItemsData },
        statusHistory: {
          create: {
            toStatus: 'PENDING',
            actorId,
            actorType: 'user',
            reason: 'Commande créée',
          },
        },
      },
      include: {
        room: true,
        items: true,
      },
    });

    // Audit
    await auditService.append({
      eventType: 'order.create',
      tenantId: hotelId,
      actorId,
      actorType: 'user',
      resourceType: 'RoomOrder',
      resourceId: order.id,
      action: 'order.create',
      metadata: { orderNumber, totalCents, itemCount: items.length },
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    // Broadcast Socket.IO (cuisine + managers)
    try {
      const realtime = getRealtimeServer();
      realtime.emitToHotel(hotelId, 'order:new', order);
    } catch (_) { /* Socket pas encore init en tests */ }

    // Notifications push aux staffs
    try {
      const staffMembers = await prisma.membership.findMany({
        where: { hotelId, role: { in: ['OWNER', 'MANAGER', 'STAFF'] } },
        include: { user: { include: { pushSubscriptions: true } } },
      });
      const endpoints = staffMembers.flatMap(m => m.user.pushSubscriptions.map((s: any) => s.endpoint));
      await pushNotificationService.sendToMany(endpoints, {
        title: `🍽️ Nouvelle commande ${orderNumber}`,
        body: `${guestName} — Suite ${order.room.number} — ${items.length} article(s)`,
        url: `/room-service/orders/${order.id}`,
        tag: 'new-order',
      });
    } catch (_) { /* Push optionnel */ }

    res.status(201).json({ success: true, data: order });
  } catch (e) {
    console.error('[room-orders] POST / error', e);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ----------------------------------------------------------------------------
// PATCH /api/room-orders/:id/transition — changer le statut
// ----------------------------------------------------------------------------
router.patch('/:id/transition', async (req: Request, res: Response) => {
  try {
    const hotelId = getTenantId(req);
    const actorId = getActorId(req);
    const { toStatus, reason, version, metadata } = req.body;

    if (!toStatus || typeof version !== 'number') {
      return res.status(400).json({ success: false, error: { message: '`toStatus` et `version` requis' } });
    }

    const order = await prisma.roomOrder.findFirst({
      where: { id: String(req.params.id), hotelId: String(hotelId) },
      include: { room: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Commande introuvable' } });
    }

    // Verrou optimiste
    if (order.version !== version) {
      return res.status(409).json({
        success: false,
        error: { message: 'Conflit de version', code: 'VERSION_CONFLICT', currentState: order },
      });
    }

    // Transition autorisée ?
    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(toStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Transition ${order.status} → ${toStatus} non autorisée`,
          code: 'INVALID_TRANSITION',
          allowed,
        },
      });
    }

    // Timestamps automatiques
    const now = new Date();
    const updateData: any = {
      status: toStatus,
      previousStatus: order.status,
      version: { increment: 1 },
    };
    const tsField = STATUS_TIMESTAMPS[toStatus];
    if (tsField) updateData[tsField] = now;
    // Auto-assign le serveur qui passe à OUT_FOR_DELIVERY
    if (toStatus === 'OUT_FOR_DELIVERY' && !order.assignedServerId) {
      updateData.assignedServerId = actorId;
    }

    // Update + historique en transaction
    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.roomOrder.update({
        where: { id: order.id },
        data: updateData,
        include: {
          room: true,
          items: true,
          assignedChef: { select: { id: true, displayName: true } },
          assignedServer: { select: { id: true, displayName: true } },
        },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus,
          actorId,
          actorType: 'user',
          reason: reason || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
      return u;
    });

    // Audit
    await auditService.append({
      eventType: 'order.transition',
      tenantId: hotelId,
      actorId,
      actorType: 'user',
      resourceType: 'RoomOrder',
      resourceId: order.id,
      action: `order.${order.status}.to.${toStatus}`,
      metadata: { orderNumber: order.orderNumber, fromStatus: order.status, toStatus },
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    // Broadcast
    try {
      const realtime = getRealtimeServer();
      realtime.emitToHotel(hotelId, 'order:updated', updated);

      // Push ciblée : commande READY → notif au serveur
      if (toStatus === 'READY' && updated.assignedServerId) {
        await pushNotificationService.sendToUser(updated.assignedServerId, {
          title: `✅ Commande ${order.orderNumber} prête`,
          body: `Suite ${updated.room.number} — ${updated.guestName}`,
          url: `/room-service/orders/${order.id}`,
          tag: 'order-ready',
        });
      }

      // DELIVERED → notif au client
      if (toStatus === 'DELIVERED' && updated.guestId) {
        await pushNotificationService.sendToUser(updated.guestId, {
          title: '🍽️ Commande livrée !',
          body: `Votre commande ${order.orderNumber} a été livrée. Bon appétit !`,
          url: `/room-service/orders/${order.id}`,
          tag: 'order-delivered',
        });
      }
    } catch (_) { /* Push optionnel */ }

    // Zaphir Core AI Orchestrator event
    eventBus.publish('order:status_changed', {
      hotelId,
      orderId: order.id,
      toStatus
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    console.error('[room-orders] transition error', e);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ----------------------------------------------------------------------------
// POST /api/room-orders/:id/rate — évaluation post-livraison
// ----------------------------------------------------------------------------
router.post('/:id/rate', async (req: Request, res: Response) => {
  try {
    const hotelId = getTenantId(req);
    const actorId = getActorId(req);
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: { message: 'Note invalide (1-5)' } });
    }

    const order = await prisma.roomOrder.findFirst({ where: { id: String(req.params.id), hotelId: String(hotelId) } });
    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Commande introuvable' } });
    }

    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ success: false, error: { message: 'Commande non livrée' } });
    }

    const updated = await prisma.roomOrder.update({
      where: { id: order.id },
      data: { rating, feedback: feedback || null, ratedAt: new Date() },
    });

    await auditService.append({
      eventType: 'order.rate',
      tenantId: hotelId,
      actorId,
      actorType: 'user',
      resourceType: 'RoomOrder',
      resourceId: order.id,
      action: 'order.rate',
      metadata: { rating, hasFeedback: !!feedback },
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ----------------------------------------------------------------------------
// GET /api/room-orders/menu — catalogue des plats (lecture publique dans l'hôtel)
// ----------------------------------------------------------------------------
router.get('/menu/items', async (req: Request, res: Response) => {
  try {
    const hotelId = getTenantId(req);
    const items = await prisma.menuItem.findMany({
      where: { hotelId, isAvailable: true, archivedAt: null },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

export default router;
