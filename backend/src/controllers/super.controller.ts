import type { Request, Response } from 'express';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { asyncHandler } from '../shared/errors/asyncHandler.js';
import { requireSuperAdmin } from '../domains/identity/auth/auth.middleware.js';
import { logAudit } from '../domains/audit/audit.service.js';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { subDays, startOfDay } from 'date-fns';

// ─── Dashboard consolidé ───────────────────────────────────────────────────────

export const getSuperDashboard = [
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const today = startOfDay(new Date());
    const last30 = subDays(today, 30);

    const [
      hotelCount,
      userCount,
      activeReservations,
      revenueLast30,
      roomsByStatus,
      reservationsByHotel,
    ] = await Promise.all([
      prisma.hotel.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.reservation.count({
        where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
      }),
      prisma.reservation.aggregate({
        _sum: { totalPrice: true },
        where: {
          createdAt: { gte: last30 },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
      }),
      prisma.room.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.reservation.groupBy({
        by: ['hotelId'],
        where: { status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
        _count: { id: true },
        _sum: { totalPrice: true },
      }),
    ]);

    const hotels = await prisma.hotel.findMany({
      select: { id: true, name: true, city: true, country: true, stars: true },
    });

    const reservationsByHotelEnriched = reservationsByHotel.map((r) => ({
      ...r,
      hotel: hotels.find((h) => h.id === r.hotelId),
    }));

    res.json({
      hotelCount,
      userCount,
      activeReservations,
      revenueLast30: revenueLast30._sum.totalPrice ?? 0,
      roomsByStatus,
      reservationsByHotel: reservationsByHotelEnriched,
      hotels,
    });
  }),
];

// ─── Liste tous les hôtels ─────────────────────────────────────────────────────

export const listAllHotels = [
  requireSuperAdmin,
  asyncHandler(async (_req: Request, res: Response) => {
    const hotels = await prisma.hotel.findMany({
      include: {
        _count: {
          select: {
            rooms: true,
            users: { where: { isActive: true } },
            reservations: true,
            guests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ hotels });
  }),
];

// ─── Créer un hôtel ────────────────────────────────────────────────────────────

const createHotelSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1).max(2),
  stars: z.number().int().min(1).max(5).default(5),
  initialAdmin: z
    .object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      password: z.string().min(8),
    })
    .optional(),
});

export const createHotel = [
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    let parsed: ReturnType<typeof createHotelSchema.parse>;
    try {
      parsed = createHotelSchema.parse(req.body);
    } catch (e: any) {
      return res.status(400).json({ error: e.flatten?.() ?? e.message });
    }

    const { initialAdmin, ...hotelData } = parsed;

    const result = await prisma.$transaction(async (tx) => {
      const hotel = await tx.hotel.create({ data: hotelData as any });

      if (initialAdmin) {
        const passwordHash = await bcrypt.hash(initialAdmin.password, 10);
        await tx.user.create({
          data: {
            email: initialAdmin.email.toLowerCase(),
            passwordHash,
            firstName: initialAdmin.firstName,
            lastName: initialAdmin.lastName,
            role: 'ADMIN',
            hotelId: hotel.id,
          },
        });
      }

      return hotel;
    });

    res.status(201).json({ hotel: result });

    // 🔒 Audit création hôtel
    await logAudit({
      actor: req.user!.userId,
      action: 'hotel.created',
      resource: 'hotel',
      resourceId: result.id,
      after: { id: result.id, name: result.name, city: result.city },
      metadata: { hasInitialAdmin: !!initialAdmin },
    }, req);
  }),
];

// ─── Mettre à jour un hôtel ────────────────────────────────────────────────────

const updateHotelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().max(2).optional(),
  stars: z.number().int().min(1).max(5).optional(),
});

export const updateHotel = [
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateHotelSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });
    if (!hotel) return res.status(404).json({ error: 'Hôtel introuvable' });

    const updated = await prisma.hotel.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    // 🔒 Audit update hôtel
    await logAudit({
      actor: req.user!.userId,
      action: 'hotel.updated',
      resource: 'hotel',
      resourceId: req.params.id,
      before: { name: hotel.name, stars: hotel.stars },
      after: { name: updated.name, stars: updated.stars },
    }, req);

    res.json({ hotel: updated });
  }),
];

// ─── Archiver un hôtel ────────────────────────────────────────────────────────

export const archiveHotel = [
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });
    if (!hotel) return res.status(404).json({ error: 'Hôtel introuvable' });

    const activeReservations = await prisma.reservation.count({
      where: {
        hotelId: hotel.id,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
      },
    });

    if (activeReservations > 0) {
      return res.status(409).json({
        error: `Impossible d'archiver : ${activeReservations} réservation(s) active(s)`,
      });
    }

    await prisma.user.updateMany({
      where: { hotelId: hotel.id },
      data: { isActive: false },
    });

    // 🔒 Audit archivage hôtel
    await logAudit({
      actor: req.user!.userId,
      action: 'hotel.archived',
      resource: 'hotel',
      resourceId: hotel.id,
      before: { name: hotel.name, city: hotel.city },
      metadata: { reason: 'super_admin_archive' },
    }, req);

    res.json({ ok: true, message: `Hôtel ${hotel.name} archivé avec succès` });
  }),
];

// ─── Statistiques d'un hôtel ───────────────────────────────────────────────────

export const getHotelStats = [
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });
    if (!hotel) return res.status(404).json({ error: 'Hôtel introuvable' });

    const last30 = subDays(new Date(), 30);

    const [roomCount, reservationCount, activeReservationCount, revenueLast30] =
      await Promise.all([
        prisma.room.count({ where: { hotelId: hotel.id } }),
        prisma.reservation.count({ where: { hotelId: hotel.id } }),
        prisma.reservation.count({
          where: { hotelId: hotel.id, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
        }),
        prisma.reservation.aggregate({
          _sum: { totalPrice: true },
          where: { hotelId: hotel.id, createdAt: { gte: last30 } },
        }),
      ]);

    const checkedIn = await prisma.reservation.count({
      where: { hotelId: hotel.id, status: 'CHECKED_IN' },
    });
    const occupancyRate = roomCount > 0 ? Math.round((checkedIn / roomCount) * 100) : 0;

    res.json({
      hotel,
      roomCount,
      reservationCount,
      activeReservationCount,
      revenueLast30: revenueLast30._sum.totalPrice ?? 0,
      occupancyRate,
    });
  }),
];
