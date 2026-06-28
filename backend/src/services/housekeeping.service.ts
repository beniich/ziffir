/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import { prisma } from '../infrastructure/database/prisma.client.js';
import { addMinutes, differenceInMinutes, isBefore } from 'date-fns';
import type { HousekeepingType, Prisma } from '@prisma/client';
import { socketEvents } from '../socket.js';
import { getIo } from '../lib/io.js';
import { ApiError } from '../shared/errors/errorHandler.js';

// ============== Création automatique ==============

/**
 * Crée une tâche de nettoyage automatiquement après un check-out.
 * Calculé selon la prochaine arrivée dans la chambre.
 */
export async function createCheckoutCleaningTask(reservationId: string, hotelId: string) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, hotelId },
    include: { room: true },
  });
  if (!reservation || !reservation.roomId) {
    throw new Error('Réservation ou chambre introuvable');
  }
  
  // Trouver la prochaine résa dans cette chambre
  const nextReservation = await prisma.reservation.findFirst({
    where: {
      roomId: reservation.roomId,
      hotelId,
      status: { in: ['CONFIRMED', 'PENDING'] },
      checkIn: { gt: reservation.checkOut },
    },
    orderBy: { checkIn: 'asc' },
  });
  
  // SLA : la chambre doit être prête 1h avant le prochain check-in (ou 3h après départ par défaut)
  const dueAt = nextReservation
    ? addMinutes(nextReservation.checkIn, -60)
    : addMinutes(reservation.checkOut, 3 * 60); 
  
  // Priorité : plus le check-in est proche, plus c'est urgent
  const hoursUntilDue = differenceInMinutes(dueAt, new Date()) / 60;
  let priority = 1;
  if (hoursUntilDue < 2) priority = 5;
  else if (hoursUntilDue < 4) priority = 4;
  else if (hoursUntilDue < 6) priority = 3;
  else if (hoursUntilDue < 12) priority = 2;
  
  // Assignation intelligente : moins chargé d'abord
  const assignee = await pickLeastBusyAttendant(hotelId);
  
  const task = await prisma.housekeepingTask.create({
    data: {
      reservationId: reservation.id,
      roomId: reservation.roomId,
      type: 'CHECKOUT_CLEAN',
      status: 'PENDING',
      priority,
      dueAt,
      assigneeId: assignee?.id,
      hotelId,
      checklist: JSON.stringify(getDefaultChecklist('CHECKOUT_CLEAN')),
    },
    include: {
      room: { select: { number: true, type: true, floor: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  
  // Notif temps réel
  socketEvents.notify(getIo(), hotelId, {
    type: 'housekeeping.task_created',
    title: 'Nouvelle tâche',
    message: `Chambre ${task.room.number} à nettoyer (priorité ${priority})`,
    level: 'info',
  });
  
  return task;
}

/**
 * Crée une tâche de type stayover (entretien pendant séjour).
 */
export async function createStayoverTask(roomId: string, hotelId: string, options: {
  dueInHours?: number;
  assigneeId?: string;
  notes?: string;
} = {}) {
  const room = await prisma.room.findFirst({ where: { id: roomId, hotelId } });
  if (!room) throw new Error('Chambre introuvable');
  
  const dueAt = options.dueInHours 
    ? addMinutes(new Date(), options.dueInHours * 60)
    : addMinutes(new Date(), 2 * 60);
  
  return prisma.housekeepingTask.create({
    data: {
      roomId,
      type: 'STAYOVER',
      status: 'PENDING',
      priority: 2,
      dueAt,
      assigneeId: options.assigneeId,
      hotelId,
      staffNotes: options.notes,
      checklist: JSON.stringify(getDefaultChecklist('STAYOVER')),
    },
    include: {
      room: { select: { number: true, type: true, floor: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

/**
 * Sélectionne l'agent de ménage le moins chargé.
 * Critères : nombre de tâches PENDING/IN_PROGRESS assignées.
 */
async function pickLeastBusyAttendant(hotelId: string) {
  // Récupère tous les STAFF + MANAGER de l'hôtel
  const attendants = await prisma.user.findMany({
    where: { hotelId, isActive: true, role: { in: ['STAFF', 'MANAGER'] } },
    select: { id: true, firstName: true, lastName: true },
  });
  if (attendants.length === 0) return null;
  
  // Compte les tâches actives par user
  const loadCounts = await prisma.housekeepingTask.groupBy({
    by: ['assigneeId'],
    where: {
      hotelId,
      assigneeId: { in: attendants.map((a) => a.id) },
      status: { in: ['PENDING', 'IN_PROGRESS'] },
    },
    _count: { id: true },
  });
  
  const loadMap = new Map(loadCounts.map((l) => [l.assigneeId, l._count.id]));
  
  // Tri par charge croissante
  attendants.sort((a, b) => (loadMap.get(a.id) ?? 0) - (loadMap.get(b.id) ?? 0));
  return attendants[0];
}

// ============== Workflow ==============

/**
 * Le personnel démarre une tâche.
 */
export async function startTask(taskId: string, hotelId: string, userId: string) {
  const task = await prisma.housekeepingTask.findFirst({
    where: { id: taskId, hotelId },
  });
  if (!task) throw new ApiError(404, 'Tâche introuvable');
  if (task.status !== 'PENDING') {
    throw new ApiError(400, `Tâche déjà ${task.status.toLowerCase()}`);
  }
  
  const updated = await prisma.housekeepingTask.update({
    where: { id: taskId },
    data: {
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      assigneeId: task.assigneeId ?? userId, // auto-assign si pas encore fait
    },
    include: {
      room: { select: { number: true, type: true, floor: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  
  socketEvents.notify(getIo(), hotelId, {
    type: 'housekeeping.task_started',
    title: 'Tâche démarrée',
    message: `Chambre ${updated.room.number} en cours de nettoyage`,
    level: 'info',
  });
  
  return updated;
}

/**
 * Le personnel termine une tâche.
 * Si un checklist est fourni, vérifie qu'il est complet.
 */
export async function completeTask(taskId: string, hotelId: string, userId: string, payload: {
  checklist?: Record<string, boolean>;
  notes?: string;
  issueReported?: boolean;
  issueDescription?: string;
}) {
  const task = await prisma.housekeepingTask.findFirst({
    where: { id: taskId, hotelId },
    include: { room: true, reservation: { include: { guest: true } } },
  });
  if (!task) throw new ApiError(404, 'Tâche introuvable');
  if (task.status !== 'IN_PROGRESS') {
    throw new ApiError(400, 'La tâche doit être en cours');
  }
  
  // Vérification checklist (au moins une case cochée si toutes sont présentes)
  if (payload.checklist) {
    const allChecked = Object.values(payload.checklist).every(Boolean);
    if (!allChecked) {
      throw new ApiError(400, 'Toutes les cases du checklist doivent être cochées');
    }
  }
  
  const updated = await prisma.housekeepingTask.update({
    where: { id: taskId },
    data: {
      status: payload.issueReported ? 'PENDING' : 'COMPLETED',  // si problème signalé, repasse en PENDING pour inspection
      completedAt: new Date(),
      checklist: payload.checklist ? JSON.stringify(payload.checklist) : task.checklist,
      staffNotes: payload.notes ?? task.staffNotes,
      issueReported: payload.issueReported ?? false,
      issueDescription: payload.issueDescription,
    },
    include: {
      room: true,
      assignee: { select: { id: true, firstName: true, lastName: true } },
      photos: true,
    },
  });
  
  // Si problème signalé : notifier les managers
  if (payload.issueReported) {
    socketEvents.notify(getIo(), hotelId, {
      type: 'housekeeping.issue_reported',
      title: '⚠️ Problème signalé',
      message: `Chambre ${task.room.number} : ${payload.issueDescription ?? 'Voir détails'}`,
      level: 'warning',
    });
  }
  
  return updated;
}

/**
 * Un superviseur inspecte et valide la tâche.
 * Si OK → la chambre redevient AVAILABLE.
 * Si KO → status REJECTED, à refaire.
 */
export async function inspectTask(taskId: string, hotelId: string, userId: string, payload: {
  approved: boolean;
  notes?: string;
}) {
  const task = await prisma.housekeepingTask.findFirst({
    where: { id: taskId, hotelId },
    include: { room: true },
  });
  if (!task) throw new ApiError(404, 'Tâche introuvable');
  if (task.status !== 'COMPLETED') {
    throw new ApiError(400, 'La tâche doit être terminée pour être inspectée');
  }
  
  if (payload.approved) {
    // Chambre → AVAILABLE
    await prisma.room.update({
      where: { id: task.roomId },
      data: { status: 'AVAILABLE' },
    });
    
    const updated = await prisma.housekeepingTask.update({
      where: { id: taskId },
      data: {
        status: 'INSPECTED',
        inspectedAt: new Date(),
        inspectedById: userId,
        inspectorNotes: payload.notes,
      },
      include: {
        room: true,
        assignee: { select: { id: true, firstName: true, lastName: true } },
        photos: true,
      },
    });
    
    socketEvents.notify(getIo(), hotelId, {
      type: 'housekeeping.task_inspected',
      title: '✓ Chambre validée',
      message: `Chambre ${task.room.number} est prête`,
      level: 'success',
    });
    
    return updated;
  } else {
    const updated = await prisma.housekeepingTask.update({
      where: { id: taskId },
      data: {
        status: 'REJECTED',
        inspectedAt: new Date(),
        inspectedById: userId,
        inspectorNotes: payload.notes,
      },
    });
    
    // Re-créer une nouvelle tâche pour refaire
    await createCheckoutCleaningTask(task.reservationId ?? '', hotelId).catch(() => {
      // Si pas de résa liée, on crée une tâche simple
      return prisma.housekeepingTask.create({
        data: {
          roomId: task.roomId,
          type: 'CHECKOUT_CLEAN',
          status: 'PENDING',
          priority: 5,
          hotelId,
          checklist: JSON.stringify(getDefaultChecklist('CHECKOUT_CLEAN')),
          staffNotes: `À refaire suite à inspection rejetée : ${payload.notes ?? ''}`,
        },
      });
    });
    
    socketEvents.notify(getIo(), hotelId, {
      type: 'housekeeping.task_rejected',
      title: '✗ Nettoyage à refaire',
      message: `Chambre ${task.room.number} : ${payload.notes ?? 'qualité insuffisante'}`,
      level: 'error',
    });
    
    return updated;
  }
}

// ============== Checklist par défaut ==============

function getDefaultChecklist(type: HousekeepingType): Record<string, boolean> {
  const base = {
    bed_made: false,
    trash_emptied: false,
    surfaces_dusted: false,
    floors_cleaned: false,
  };
  
  if (type === 'CHECKOUT_CLEAN' || type === 'DEEP_CLEAN') {
    return {
      ...base,
      sheets_changed: false,
      pillows_fluffed: false,
      bathroom_cleaned: false,
      towels_replaced: false,
      toiletries_restocked: false,
      minibar_restocked: false,
      tv_remote_wiped: false,
      ac_set_to_22: false,
      curtains_closed: false,
      welcome_card_placed: false,
    };
  }
  
  if (type === 'STAYOVER') {
    return {
      bed_made: false,
      trash_emptied: false,
      towels_replaced: false,
      toiletries_checked: false,
    };
  }
  
  if (type === 'INSPECTION') {
    return {
      bed_made: false,
      bathroom_clean: false,
      surfaces_dusted: false,
      minibar_complete: false,
      no_damage: false,
    };
  }
  
  return base;
}
