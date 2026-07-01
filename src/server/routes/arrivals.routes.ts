// src/server/routes/arrivals.routes.ts
// ============================================================================
// Arrivals VIP — CRUD + workflow + tasks + webhooks externes
// ============================================================================

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auditService } from '../domains/shared/services/audit.service.js';
import { getRealtimeServer } from '../realtime/socketServer.js';
import { pushNotificationService } from '../services/push-notification.service.js';
import { arrivalPlannerService } from '../domains/arrivals/arrival-planner.service.js';
import { externalSyncService } from '../domains/arrivals/external-sync.service.js';
import { eventBus } from '../core/eventBus.js';

const router = Router();
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getAuth(req: Request) {
  const auth = (req as any).auth;
  return {
    hotelId: auth?.hotelId || auth?.tenantId || 'hotel-dev',
    actorId: auth?.uid || auth?.sub || 'system',
    role: (auth?.role || 'hotel').toLowerCase(),
  };
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  SCHEDULED:      ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:      ['IN_PREPARATION', 'CANCELLED'],
  IN_PREPARATION: ['DRIVER_EN_ROUTE', 'ENROUTE', 'CANCELLED'],
  DRIVER_EN_ROUTE:['ENROUTE', 'AT_HOTEL', 'CANCELLED'],
  ENROUTE:        ['LANDED', 'AT_HOTEL', 'NO_SHOW', 'CANCELLED'],
  LANDED:         ['AT_HOTEL', 'CANCELLED'],
  AT_HOTEL:       ['CHECKED_IN'],
  CHECKED_IN:     [],
  NO_SHOW:        [],
  CANCELLED:      [],
};

// ---------------------------------------------------------------------------
// GET /api/arrivals
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { hotelId } = getAuth(req);
    const { status, vipLevel, upcoming, from, to } = req.query as Record<string, string>;

    const where: any = { hotelId };

    if (status) {
      where.status = status.includes(',') ? { in: status.split(',') } : status;
    } else if (upcoming === 'true') {
      where.scheduledArrivalAt = { gte: new Date() };
      where.status = {
        in: ['SCHEDULED', 'CONFIRMED', 'IN_PREPARATION', 'DRIVER_EN_ROUTE', 'ENROUTE', 'LANDED'],
      };
    }

    if (vipLevel) where.vipLevel = vipLevel;
    if (from || to) {
      where.scheduledArrivalAt = {};
      if (from) where.scheduledArrivalAt.gte = new Date(from);
      if (to) where.scheduledArrivalAt.lte = new Date(to);
    }

    const arrivals = await prisma.arrival.findMany({
      where,
      include: {
        room: { select: { number: true, type: true } },
        host: { select: { displayName: true } },
        tasks: {
          select: { id: true, team: true, status: true, isCritical: true, dueAt: true },
        },
      },
      orderBy: { scheduledArrivalAt: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: arrivals });
  } catch (e) {
    console.error('[arrivals] GET /', e);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/arrivals/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { hotelId } = getAuth(req);

    const arrival = await prisma.arrival.findFirst({
      where: { id: String(req.params.id), hotelId: String(hotelId) },
      include: {
        room: true,
        host: { select: { displayName: true, email: true } },
        createdBy: { select: { displayName: true } },
        tasks: {
          orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }],
          include: {
            assignedUser: { select: { id: true, displayName: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 30,
          include: { actor: { select: { displayName: true } } },
        },
        externalUpdates: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!arrival) {
      return res.status(404).json({ success: false, error: { message: 'Arrivée introuvable' } });
    }

    res.json({ success: true, data: arrival });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/arrivals
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const { hotelId, actorId } = getAuth(req);
    const {
      guestName, guestEmail, guestPhone, guestLanguage,
      vipLevel, transportMode,
      scheduledArrivalAt, scheduledDepartureAt,
      flightNumber, flightOrigin,
      roomId, suiteReadyBy, suiteNotes,
      welcomeAmenity, dietaryNotes, specialRequests,
      meetingPoint, hostUserId,
      estimatedRevenueCents, externalRef, confirmationNumber,
    } = req.body;

    if (!guestName || !transportMode || !scheduledArrivalAt || !suiteReadyBy) {
      return res.status(400).json({
        success: false,
        error: { message: 'Champs requis manquants : guestName, transportMode, scheduledArrivalAt, suiteReadyBy' },
      });
    }

    // Vérification room si fournie
    if (roomId) {
      const room = await prisma.room.findFirst({ where: { id: roomId } });
      if (!room) {
        return res.status(400).json({ success: false, error: { message: 'Suite introuvable' } });
      }
    }

    const { arrival, taskCount } = await arrivalPlannerService.createArrivalWithTasks(hotelId, {
      guestName, guestEmail, guestPhone,
      guestLanguage: guestLanguage || 'fr',
      vipLevel: vipLevel || 'CLASSIC',
      transportMode,
      scheduledArrivalAt: new Date(scheduledArrivalAt),
      scheduledDepartureAt: scheduledDepartureAt ? new Date(scheduledDepartureAt) : undefined,
      flightNumber, flightOrigin,
      roomId, suiteReadyBy: new Date(suiteReadyBy), suiteNotes,
      welcomeAmenity, dietaryNotes, specialRequests,
      meetingPoint, hostUserId,
      estimatedRevenueCents,
      externalRef, confirmationNumber,
      createdById: actorId,
    });

    await auditService.append({
      eventType: 'arrival.create',
      tenantId: hotelId,
      actorId,
      actorType: 'user',
      resourceType: 'Arrival',
      resourceId: arrival.id,
      action: 'arrival.create',
      metadata: { guestName, vipLevel, transportMode, taskCount },
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    try {
      getRealtimeServer().emitToHotel(hotelId, 'arrival:new', { arrival, taskCount });
    } catch (_) {}

    // Push au host si défini
    if (hostUserId) {
      await pushNotificationService.sendToUser(hostUserId, {
        title: `🌟 Nouvelle arrivée ${vipLevel || 'CLASSIC'}`,
        body: `${guestName} — ${new Date(scheduledArrivalAt).toLocaleString('fr-FR')}`,
        url: `/arrivals/${arrival.id}`,
        tag: 'new-arrival',
      }).catch(() => {});
    }

    // Orchestrateur : signaler la nouvelle arrivée
    eventBus.publish('logistics:arrival', { hotelId, arrivalId: arrival.id, guestName, vipLevel });

    res.status(201).json({ success: true, data: { arrival, taskCount } });
  } catch (e: any) {
    console.error('[arrivals] POST /', e);
    res.status(500).json({ success: false, error: { message: e.message || 'Erreur serveur' } });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/arrivals/:id/transition
// ---------------------------------------------------------------------------
router.patch('/:id/transition', async (req: Request, res: Response) => {
  try {
    const { hotelId, actorId } = getAuth(req);
    const { toStatus, reason, version, driverInfo, actualArrivalAt } = req.body;

    if (!toStatus || typeof version !== 'number') {
      return res.status(400).json({ success: false, error: { message: '`toStatus` et `version` requis' } });
    }

    const arrival = await prisma.arrival.findFirst({
      where: { id: String(req.params.id), hotelId: String(hotelId) },
      include: { tasks: true },
    });

    if (!arrival) return res.status(404).json({ success: false, error: { message: 'Arrivée introuvable' } });

    // Verrou optimiste
    if (arrival.version !== version) {
      return res.status(409).json({
        success: false,
        error: { message: 'Conflit de version', code: 'VERSION_CONFLICT', currentVersion: arrival.version },
      });
    }

    // Transition autorisée ?
    const allowed = ALLOWED_TRANSITIONS[arrival.status] || [];
    if (!allowed.includes(toStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Transition ${arrival.status} → ${toStatus} non autorisée`,
          code: 'INVALID_TRANSITION',
          allowed,
        },
      });
    }

    // Bloquer CHECKED_IN si tâches critiques non terminées
    if (toStatus === 'CHECKED_IN') {
      const criticalPending = (arrival as any).tasks.filter(
        (t: any) => t.isCritical && !['COMPLETED', 'CANCELLED'].includes(t.status)
      );
      if (criticalPending.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Tâches critiques non terminées',
            code: 'CRITICAL_TASKS_PENDING',
            tasks: criticalPending.map((t: any) => t.title),
          },
        });
      }
    }

    // Construire la mise à jour
    const updateData: any = {
      status: toStatus,
      previousStatus: arrival.status,
      version: { increment: 1 },
    };

    if (actualArrivalAt) updateData.actualArrivalAt = new Date(actualArrivalAt);
    if (driverInfo) {
      updateData.driverName = driverInfo.driverName;
      updateData.driverPhone = driverInfo.driverPhone;
      updateData.driverVehicle = driverInfo.driverVehicle;
      updateData.driverAssignedAt = new Date();
      if (driverInfo.driverEta) updateData.driverEta = new Date(driverInfo.driverEta);
    }

    // Annulation → annuler toutes les tâches en cours
    let cancelledTaskIds: string[] = [];
    if (toStatus === 'CANCELLED') {
      const toCancel = arrival.tasks.filter(t => !['COMPLETED', 'CANCELLED', 'FAILED'].includes(t.status));
      cancelledTaskIds = toCancel.map(t => t.id);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.arrival.update({
        where: { id: arrival.id },
        data: updateData,
        include: { room: true, tasks: true },
      });

      await tx.arrivalStatusEvent.create({
        data: {
          arrivalId: arrival.id,
          fromStatus: arrival.status as any,
          toStatus,
          actorId,
          actorType: 'user',
          reason: reason || null,
        },
      });

      for (const taskId of cancelledTaskIds) {
        await tx.arrivalTask.update({ where: { id: taskId }, data: { status: 'CANCELLED' } });
      }

      return u;
    });

    await auditService.append({
      eventType: 'arrival.transition',
      tenantId: hotelId,
      actorId,
      actorType: 'user',
      resourceType: 'Arrival',
      resourceId: arrival.id,
      action: `arrival.${arrival.status.toLowerCase()}.to.${toStatus.toLowerCase()}`,
      metadata: { fromStatus: arrival.status, toStatus, guestName: arrival.guestName },
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    try {
      getRealtimeServer().emitToHotel(hotelId, 'arrival:updated', updated);

      if (toStatus === 'AT_HOTEL' && arrival.hostUserId) {
        await pushNotificationService.sendToUser(arrival.hostUserId, {
          title: `🎉 ${arrival.guestName} est arrivé(e)`,
          body: `Niveau ${arrival.vipLevel} — accueil requis immédiatement`,
          url: `/arrivals/${arrival.id}`,
          tag: 'arrival-on-site',
        });
      }
    } catch (_) {}

    // Orchestrateur : signaler si chauffeur approche
    if (toStatus === 'DRIVER_EN_ROUTE') {
      eventBus.publish('logistics:driver_status', {
        hotelId,
        roomId: arrival.roomId,
        status: 'APPROACHING_HOTEL',
      });
    }

    res.json({ success: true, data: updated });
  } catch (e) {
    console.error('[arrivals] transition error', e);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/arrivals/:arrivalId/tasks — ajouter une tâche manuelle
// ---------------------------------------------------------------------------
router.post('/:arrivalId/tasks', async (req: Request, res: Response) => {
  try {
    const { hotelId } = getAuth(req);
    const { team, title, description, dueAt, assignedUserId, priority, isCritical } = req.body;

    const arrival = await prisma.arrival.findFirst({ where: { id: String(req.params.arrivalId), hotelId: String(hotelId) } });
    if (!arrival) return res.status(404).json({ success: false, error: { message: 'Arrivée introuvable' } });

    const task = await prisma.arrivalTask.create({
      data: {
        arrivalId: arrival.id,
        hotelId,
        team: team || 'RECEPTION',
        title,
        description: description || null,
        dueAt: dueAt ? new Date(dueAt) : null,
        assignedUserId: assignedUserId || null,
        priority: priority ?? 0,
        isCritical: isCritical ?? false,
        status: 'PENDING',
        blockedBy: '[]',
      },
    });

    if (task.assignedUserId) {
      await pushNotificationService.sendToUser(task.assignedUserId, {
        title: `📋 Nouvelle tâche : ${task.title}`,
        body: `Arrivée ${arrival.guestName} · Équipe ${task.team}`,
        url: `/arrivals/${arrival.id}`,
        tag: 'new-task',
      }).catch(() => {});
    }

    try {
      getRealtimeServer().emitToHotel(hotelId, 'task:new', { task, arrivalId: arrival.id });
    } catch (_) {}

    res.status(201).json({ success: true, data: task });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/arrivals/tasks/:taskId — mettre à jour une tâche
// ---------------------------------------------------------------------------
router.patch('/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { hotelId, actorId } = getAuth(req);
    const { status, assignedUserId, version, notes, evidenceUrl } = req.body;

    const task = await prisma.arrivalTask.findFirst({
      where: { id: String(req.params.taskId), hotelId: String(hotelId) },
    });
    if (!task) return res.status(404).json({ success: false, error: { message: 'Tâche introuvable' } });

    if (typeof version === 'number' && task.version !== version) {
      return res.status(409).json({
        success: false,
        error: { message: 'Conflit de version', code: 'VERSION_CONFLICT' },
      });
    }

    // Vérifier les bloquants
    if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
      const blockedByIds: string[] = JSON.parse(task.blockedBy || '[]');
      if (blockedByIds.length > 0) {
        const blockers = await prisma.arrivalTask.findMany({
          where: { id: { in: blockedByIds } },
          select: { status: true, title: true },
        });
        const stillBlocking = blockers.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status));
        if (stillBlocking.length > 0) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Tâche bloquée',
              code: 'TASK_BLOCKED',
              blockingTasks: stillBlocking.map(b => b.title),
            },
          });
        }
      }
    }

    const now = new Date();
    const updateData: any = { version: { increment: 1 } };

    if (status) {
      updateData.status = status;
      if (status === 'IN_PROGRESS' && !task.startedAt) updateData.startedAt = now;
      if (status === 'COMPLETED' && !task.completedAt) {
        updateData.completedAt = now;
        updateData.completedById = actorId;
        if (notes) updateData.completionNotes = notes;
      }
    }
    if (assignedUserId !== undefined) updateData.assignedUserId = assignedUserId || null;
    if (evidenceUrl) updateData.evidenceUrl = evidenceUrl;

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.arrivalTask.update({
        where: { id: task.id },
        data: updateData,
        include: { assignedUser: { select: { displayName: true } } },
      });

      await tx.taskEvent.create({
        data: {
          taskId: task.id,
          fromStatus: task.status as any,
          toStatus: (status || task.status) as any,
          actorId,
          notes: notes || null,
        },
      });

      return u;
    });

    await auditService.append({
      eventType: 'task.update',
      tenantId: hotelId,
      actorId,
      actorType: 'user',
      resourceType: 'ArrivalTask',
      resourceId: task.id,
      action: `task.${(status || task.status).toLowerCase()}`,
      metadata: { arrivalId: task.arrivalId, team: task.team, title: task.title },
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    try {
      getRealtimeServer().emitToHotel(hotelId, 'task:updated', { task: updated, arrivalId: task.arrivalId });
      if (status === 'COMPLETED' && task.isCritical) {
        getRealtimeServer().emitToHotel(hotelId, 'task:critical:done', {
          task: updated,
          arrivalId: task.arrivalId,
        });
      }
    } catch (_) {}

    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ---------------------------------------------------------------------------
// Webhooks externes (flight tracking, driver location)
// ---------------------------------------------------------------------------
router.post('/webhook/flight-update', async (req: Request, res: Response) => {
  const sig = req.headers['x-webhook-signature'];
  if (process.env.FLIGHT_WEBHOOK_SECRET && sig !== process.env.FLIGHT_WEBHOOK_SECRET) {
    return res.status(401).json({ success: false, error: { message: 'Invalid signature' } });
  }
  const { hotelId } = getAuth(req);
  await externalSyncService.processFlightUpdate(req.body, hotelId);
  res.json({ success: true });
});

router.post('/webhook/driver-location', async (req: Request, res: Response) => {
  const sig = req.headers['x-webhook-signature'];
  if (process.env.DRIVER_WEBHOOK_SECRET && sig !== process.env.DRIVER_WEBHOOK_SECRET) {
    return res.status(401).json({ success: false, error: { message: 'Invalid signature' } });
  }
  const { hotelId } = getAuth(req);
  await externalSyncService.processDriverUpdate(req.body, hotelId);
  res.json({ success: true });
});

export default router;
