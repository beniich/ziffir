import type { Request, Response } from 'express';
import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { getTenantIdOrThrow } from '../../../shared/utils/tenant.js';
import { z } from 'zod';
import { emailService } from '../../../infrastructure/email/email.service.js';
import { createCheckoutCleaningTask } from '../../../services/housekeeping.service.js';
import { queueWebhook } from '../../../infrastructure/webhooks/webhook-dispatcher.service.js';
import { logAudit } from '../../audit/audit.service.js';

// ─── Validation Schemas ───────────────────────────────────────

const createReservationSchema = z.object({
  guestId: z.string().min(1),
  roomId: z.string().min(1),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  source: z.enum(['DIRECT', 'BOOKING', 'EXPEDIA', 'AIRBNB', 'OTHER']).optional(),
  discount: z.number().min(0).optional(),
  extras: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const updateReservationSchema = z.object({
  notes: z.string().optional(),
  source: z.string().optional(),
  discount: z.number().min(0).optional(),
  extras: z.number().min(0).optional(),
});

// ─── Helpers ─────────────────────────────────────────────────

function calcNights(checkIn: Date, checkOut: Date) {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
}

// Check if a room is available for given dates (excluding an optional reservationId)
async function isRoomAvailable(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeId?: string
): Promise<boolean> {
  const conflict = await prisma.reservation.findFirst({
    where: {
      roomId,
      id: excludeId ? { not: excludeId } : undefined,
      status: { notIn: ['CANCELLED', 'NO_SHOW', 'CHECKED_OUT'] },
      // Overlap: existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });
  return conflict === null;
}

// ─── Controllers ─────────────────────────────────────────────

// GET /api/reservations
export async function listReservations(req: Request, res: Response) {
  const {
    status,
    roomId,
    guestId,
    from,
    to,
    page = '1',
    pageSize = '20',
  } = req.query as Record<string, string>;

  const hotelId = await getTenantIdOrThrow(req);
  const skip = (Number(page) - 1) * Number(pageSize);

  const where: Record<string, unknown> = { hotelId };
  if (status) where.status = status;
  if (roomId) where.roomId = roomId;
  if (guestId) where.guestId = guestId;
  if (from || to) {
    where.checkIn = {};
    if (from) (where.checkIn as Record<string, unknown>).gte = new Date(from);
    if (to) (where.checkIn as Record<string, unknown>).lte = new Date(to);
  }

  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      skip,
      take: Number(pageSize),
      orderBy: { checkIn: 'asc' },
      include: {
        guest: { select: { id: true, firstName: true, lastName: true, email: true, vip: true } },
        room: { select: { id: true, number: true, floor: true, type: true } },
      },
    }),
    prisma.reservation.count({ where }),
  ]);

  res.json({
    items,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total,
      totalPages: Math.ceil(total / Number(pageSize)),
      hasNext: skip + items.length < total,
      hasPrev: Number(page) > 1,
    },
  });
}

// GET /api/reservations/calendar?from=&to=
// Returns a flat list of reservations for the calendar view
export async function getCalendar(req: Request, res: Response) {
  const { from, to } = req.query as Record<string, string>;
  if (!from || !to) return res.status(400).json({ error: 'from et to sont requis' });

  const hotelId = await getTenantIdOrThrow(req);
  const reservations = await prisma.reservation.findMany({
    where: {
      hotelId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      checkIn: { lt: new Date(to) },
      checkOut: { gt: new Date(from) },
    },
    include: {
      guest: { select: { firstName: true, lastName: true, vip: true } },
      room: { select: { number: true, floor: true, type: true } },
    },
    orderBy: { checkIn: 'asc' },
  });
  res.json(reservations);
}

// GET /api/reservations/:id
export async function getReservation(req: Request, res: Response) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: req.params.id, hotelId: await getTenantIdOrThrow(req) },
    include: {
      guest: true,
      room: true,
      confirmedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  if (!reservation) return res.status(404).json({ error: 'Réservation introuvable' });
  res.json(reservation);
}

// POST /api/reservations
export async function createReservation(req: Request, res: Response) {
  const parsed = createReservationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { guestId, roomId, checkIn: rawCheckIn, checkOut: rawCheckOut, discount = 0, extras = 0, source, notes } = parsed.data;
  const hotelId = await getTenantIdOrThrow(req);

  const checkIn = new Date(rawCheckIn);
  const checkOut = new Date(rawCheckOut);

  if (checkOut <= checkIn) {
    return res.status(400).json({ error: 'La date de départ doit être après la date d\'arrivée' });
  }

  // Verify guest belongs to hotel
  const guest = await prisma.guest.findFirst({ where: { id: guestId, hotelId } });
  if (!guest) return res.status(404).json({ error: 'Client introuvable' });

  // Verify room belongs to hotel
  const room = await prisma.room.findFirst({ where: { id: roomId, hotelId } });
  if (!room) return res.status(404).json({ error: 'Chambre introuvable' });

  // Availability check
  const available = await isRoomAvailable(roomId, checkIn, checkOut);
  if (!available) {
    return res.status(409).json({ error: 'Cette chambre est déjà réservée pour ces dates' });
  }

  const nights = calcNights(checkIn, checkOut);
  const totalPrice = room.price * nights + extras - discount;

  const reservation = await prisma.reservation.create({
    data: {
      guestId,
      roomId,
      hotelId,
      checkIn,
      checkOut,
      nights,
      pricePerNight: room.price,
      totalPrice,
      discount,
      extras,
      source,
      notes,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    },
    include: {
      guest: { select: { firstName: true, lastName: true, email: true } },
      room: { select: { number: true, type: true } },
    },
  });

  // Dispatch Webhook
  queueWebhook(hotelId, 'reservation.created', { reservation });

  // Log audit
  await logAudit({
    actor: (req as any).user?.userId || 'system',
    action: 'reservation.created',
    resource: 'reservation',
    resourceId: reservation.id,
    after: reservation,
    metadata: { source: source || 'web_app' },
  }, req);

  res.status(201).json(reservation);
}

// PATCH /api/reservations/:id
export async function updateReservation(req: Request, res: Response) {
  const parsed = updateReservationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.reservation.findFirst({
    where: { id: req.params.id, hotelId: await getTenantIdOrThrow(req) },
  });
  if (!existing) return res.status(404).json({ error: 'Réservation introuvable' });

  // Recalculate total if discount/extras changed
  let totalPrice = existing.totalPrice;
  const discount = parsed.data.discount ?? existing.discount;
  const extras = parsed.data.extras ?? existing.extras;
  totalPrice = existing.pricePerNight * existing.nights + extras - discount;

  const reservation = await prisma.reservation.update({
    where: { id: req.params.id },
    data: { ...parsed.data, totalPrice },
  });
  res.json(reservation);
}

// POST /api/reservations/:id/confirm
export async function confirmReservation(req: Request, res: Response) {
  const existing = await prisma.reservation.findFirst({
    where: { id: req.params.id, hotelId: await getTenantIdOrThrow(req) },
  });
  if (!existing) return res.status(404).json({ error: 'Réservation introuvable' });
  if (existing.status !== 'PENDING') {
    return res.status(409).json({ error: `Impossible de confirmer une réservation en statut ${existing.status}` });
  }

  const reservation = await prisma.reservation.update({
    where: { id: req.params.id },
    data: { status: 'CONFIRMED', confirmedById: req.user!.userId },
    include: { guest: true, room: true },
  });

  // Envoyer l'email de confirmation en arrière-plan
  if (reservation.guest?.email) {
    emailService.sendConfirmation(
      `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      reservation.guest.email,
      reservation.checkIn,
      reservation.checkOut,
      reservation.room?.number || 'Non attribuée'
    ).catch(err => console.error('Erreur envoi email:', err));
  }

  // Dispatch Webhook
  queueWebhook(existing.hotelId, 'reservation.confirmed', { reservation });

  res.json(reservation);
}

// POST /api/reservations/:id/check-in
export async function checkIn(req: Request, res: Response) {
  const existing = await prisma.reservation.findFirst({
    where: { id: req.params.id, hotelId: await getTenantIdOrThrow(req) },
    include: { room: true },
  });
  if (!existing) return res.status(404).json({ error: 'Réservation introuvable' });
  if (existing.status !== 'CONFIRMED') {
    return res.status(409).json({ error: 'La réservation doit être confirmée avant le check-in' });
  }

  const [reservation] = await prisma.$transaction([
    prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CHECKED_IN', checkedInAt: new Date() },
    }),
    prisma.room.update({
      where: { id: existing.roomId },
      data: { status: 'OCCUPIED' },
    }),
  ]);
  res.json(reservation);
}

// POST /api/reservations/:id/check-out
export async function checkOut(req: Request, res: Response) {
  const hotelId = await getTenantIdOrThrow(req);
  const existing = await prisma.reservation.findFirst({
    where: { id: req.params.id, hotelId },
    include: { room: true },
  });
  if (!existing) return res.status(404).json({ error: 'Réservation introuvable' });
  if (existing.status !== 'CHECKED_IN') {
    return res.status(409).json({ error: 'Le client doit être en check-in pour effectuer un check-out' });
  }

  const [reservation] = await prisma.$transaction([
    prisma.reservation.update({
      where: { id: req.params.id },
      data: {
        status: 'CHECKED_OUT',
        checkedOutAt: new Date(),
        paymentStatus: 'PAID',
      },
      include: { guest: true },
    }),
    prisma.room.update({
      where: { id: existing.roomId },
      data: { status: 'CLEANING' },
    }),
  ]);

  try {
    await createCheckoutCleaningTask(reservation.id, hotelId);
  } catch (e) {
    console.error('Failed to create housekeeping task:', e);
  }

  // Envoyer la facture/reçu par email
  if (reservation.guest?.email) {
    emailService.sendCheckOutReceipt(
      `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      reservation.guest.email,
      reservation.totalPrice
    ).catch(err => console.error('Erreur envoi email:', err));
  }

  res.json(reservation);
}

// POST /api/reservations/:id/cancel
export async function cancelReservation(req: Request, res: Response) {
  const { reason } = req.body as { reason?: string };

  const existing = await prisma.reservation.findFirst({
    where: { id: req.params.id, hotelId: await getTenantIdOrThrow(req) },
  });
  if (!existing) return res.status(404).json({ error: 'Réservation introuvable' });

  if (['CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].includes(existing.status)) {
    return res.status(409).json({ error: `Impossible d'annuler une réservation en statut ${existing.status}` });
  }

  const reservation = await prisma.reservation.update({
    where: { id: req.params.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason,
    },
  });

  // Free the room if it was occupied
  if (existing.status === 'CHECKED_IN') {
    await prisma.room.update({
      where: { id: existing.roomId },
      data: { status: 'CLEANING' },
    });
  }

  // Dispatch Webhook
  queueWebhook(existing.hotelId, 'reservation.cancelled', { reservation, reason });

  res.json(reservation);
}

// GET /api/reservations/stats — KPIs for dashboard
export async function getReservationStats(req: Request, res: Response) {
  const hotelId = await getTenantIdOrThrow(req);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalActive,
    checkInsToday,
    checkOutsToday,
    pendingConfirmation,
    revenueResult,
    occupancyResult,
  ] = await Promise.all([
    prisma.reservation.count({ where: { hotelId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } } }),
    prisma.reservation.count({ where: { hotelId, status: 'CONFIRMED', checkIn: { gte: today, lt: tomorrow } } }),
    prisma.reservation.count({ where: { hotelId, status: 'CHECKED_IN', checkOut: { gte: today, lt: tomorrow } } }),
    prisma.reservation.count({ where: { hotelId, status: 'PENDING' } }),
    prisma.reservation.aggregate({
      where: { hotelId, paymentStatus: 'PAID' },
      _sum: { totalPrice: true },
    }),
    prisma.reservation.count({ where: { hotelId, status: 'CHECKED_IN' } }),
  ]);

  const totalRooms = await prisma.room.count({ where: { hotelId } });

  res.json({
    totalActive,
    checkInsToday,
    checkOutsToday,
    pendingConfirmation,
    totalRevenue: revenueResult._sum.totalPrice ?? 0,
    occupancyRate: totalRooms > 0 ? Math.round((occupancyResult / totalRooms) * 100) : 0,
  });
}
