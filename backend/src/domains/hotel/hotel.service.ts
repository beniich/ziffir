/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { Prisma } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { ApiError } from '../../shared/errors/errorHandler.js';
import { encryptPII } from '../../lib/crypto.js';
import { logAudit } from '../audit/audit.service.js';
import { buildPagination, getSkip, type Pagination } from '../shared/utils/pagination.js';
import { buildSearchFilter } from '../shared/utils/query.js';
import type {
  CreateHotelInput,
  UpdateHotelInput,
  UpdateSettingsInput,
} from './hotel.validation.js';
import type { Request } from 'express';

// =============================================================================
// CREATE HOTEL (SUPER_ADMIN only)
// =============================================================================
export async function createHotel(input: CreateHotelInput, req?: Request) {
  // Check slug uniqueness
  const existing = await prisma.hotel.findUnique({ where: { slug: input.slug } });
  if (existing) throw new ApiError(409, 'Ce slug est déjà utilisé');

  const hotel = await prisma.hotel.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      address: input.address,
      city: input.city,
      postalCode: input.postalCode,
      country: input.country,
      phone: input.phone ? encryptPII(input.phone) : null,
      email: input.email,
      stars: input.stars,
      category: input.category,
      settings: (input.settings ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'HOTEL_CREATED',
    resource: 'hotel',
    resourceId: hotel.id,
    after: {
      id: hotel.id,
      name: hotel.name,
      slug: hotel.slug,
      city: hotel.city,
    },
  }, req);

  return hotel;
}

// =============================================================================
// LIST HOTELS (SUPER_ADMIN only)
// =============================================================================
export async function listHotels(params: {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: string;
  city?: string;
}) {
  const where: Prisma.HotelWhereInput = {
    ...(params.isActive !== undefined && { isActive: params.isActive === 'true' }),
    ...(params.city && { city: { contains: params.city } }),
    ...buildSearchFilter(['name', 'slug', 'email'], params.search),
  };

  const [items, total] = await Promise.all([
    prisma.hotel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: getSkip(params.page, params.pageSize),
      take: params.pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        country: true,
        stars: true,
        category: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            rooms: true,
            reservations: true,
            guests: true,
          },
        },
      },
    }),
    prisma.hotel.count({ where }),
  ]);

  return {
    items,
    pagination: buildPagination(params.page, params.pageSize, total),
  };
}

// =============================================================================
// GET CURRENT HOTEL (any authenticated user)
// =============================================================================
export async function getCurrentHotel(userHotelId: string) {
  const hotel = await prisma.hotel.findUnique({
    where: { id: userHotelId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      city: true,
      postalCode: true,
      country: true,
      phone: true,
      email: true,
      stars: true,
      category: true,
      settings: true,
      isActive: true,
      trialEndsAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          users: true,
          rooms: true,
          reservations: true,
          guests: true,
        },
      },
    },
  });

  if (!hotel) throw new ApiError(404, 'Hôtel introuvable');
  return hotel;
}

// =============================================================================
// GET HOTEL BY ID
// =============================================================================
export async function getHotelById(id: string) {
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          rooms: true,
          reservations: true,
          guests: true,
          invoices: true,
          channels: true,
        },
      },
    },
  });

  if (!hotel) throw new ApiError(404, 'Hôtel introuvable');
  return hotel;
}

// =============================================================================
// UPDATE CURRENT HOTEL (ADMIN)
// =============================================================================
export async function updateCurrentHotel(
  hotelId: string,
  input: UpdateHotelInput,
  req?: Request
) {
  const before = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!before) throw new ApiError(404, 'Hôtel introuvable');

  const hotel = await prisma.hotel.update({
    where: { id: hotelId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.city !== undefined && { city: input.city }),
      ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
      ...(input.country !== undefined && { country: input.country }),
      ...(input.phone !== undefined && { phone: encryptPII(input.phone) }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.stars !== undefined && { stars: input.stars }),
      ...(input.category !== undefined && { category: input.category }),
    },
  });

  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'HOTEL_UPDATED',
    resource: 'hotel',
    resourceId: hotel.id,
    before: {
      name: before.name,
      description: before.description,
      email: before.email,
      stars: before.stars,
    },
    after: {
      name: hotel.name,
      description: hotel.description,
      email: hotel.email,
      stars: hotel.stars,
    },
  }, req);

  return hotel;
}

// =============================================================================
// UPDATE HOTEL SETTINGS (ADMIN)
// =============================================================================
export async function updateHotelSettings(
  hotelId: string,
  input: UpdateSettingsInput,
  req?: Request
) {
  const before = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { settings: true },
  });
  if (!before) throw new ApiError(404, 'Hôtel introuvable');

  const hotel = await prisma.hotel.update({
    where: { id: hotelId },
    data: {
      settings: input as Prisma.InputJsonValue,
    },
  });

  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'HOTEL_UPDATED',
    resource: 'hotel',
    resourceId: hotel.id,
    before: { settings: before.settings },
    after: { settings: hotel.settings },
    metadata: { type: 'settings_update' },
  }, req);

  return hotel;
}

// =============================================================================
// GET HOTEL STATS
// =============================================================================
export async function getHotelStats(hotelId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalRooms,
    availableRooms,
    occupiedRooms,
    cleaningRooms,
    maintenanceRooms,
    todayArrivals,
    todayDepartures,
    inHouseGuests,
    totalGuests,
    monthReservations,
    monthRevenue,
    activeUsers,
    activeChannels,
  ] = await Promise.all([
    prisma.room.count({ where: { hotelId, isActive: true } }),
    prisma.room.count({ where: { hotelId, status: 'AVAILABLE' } }),
    prisma.room.count({ where: { hotelId, status: 'OCCUPIED' } }),
    prisma.room.count({ where: { hotelId, status: 'CLEANING' } }),
    prisma.room.count({ where: { hotelId, status: 'MAINTENANCE' } }),
    prisma.reservation.count({
      where: { hotelId, checkIn: { gte: today, lt: tomorrow }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
    }),
    prisma.reservation.count({
      where: { hotelId, checkOut: { gte: today, lt: tomorrow }, status: 'CHECKED_IN' },
    }),
    prisma.reservation.count({
      where: { hotelId, status: 'CHECKED_IN' },
    }),
    prisma.guest.count({ where: { hotelId, isAnonymized: false } }),
    prisma.reservation.count({
      where: { hotelId, createdAt: { gte: monthStart }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
    }),
    prisma.reservation.aggregate({
      where: {
        hotelId,
        createdAt: { gte: monthStart },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      _sum: { totalCents: true },
    }),
    prisma.user.count({ where: { hotelId, isActive: true } }),
    prisma.channel.count({ where: { hotelId, status: 'ACTIVE' } }),
  ]);

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return {
    rooms: {
      total: totalRooms,
      available: availableRooms,
      occupied: occupiedRooms,
      cleaning: cleaningRooms,
      maintenance: maintenanceRooms,
      occupancyRate,
    },
    today: {
      arrivals: todayArrivals,
      departures: todayDepartures,
      inHouseGuests,
    },
    guests: {
      total: totalGuests,
    },
    month: {
      reservations: monthReservations,
      revenueCents: monthRevenue._sum.totalCents ?? 0,
    },
    users: {
      active: activeUsers,
    },
    channels: {
      active: activeChannels,
    },
  };
}

// =============================================================================
// SOFT DELETE HOTEL (SUPER_ADMIN)
// =============================================================================
export async function deactivateHotel(id: string, req?: Request) {
  const hotel = await prisma.hotel.findUnique({ where: { id } });
  if (!hotel) throw new ApiError(404, 'Hôtel introuvable');

  // Prevent deleting the last active SUPER_ADMIN's hotel if needed
  const userCount = await prisma.user.count({
    where: { hotelId: id, isActive: true },
  });

  if (userCount > 0 && hotel.isActive) {
    // Soft delete: deactivate
    const updated = await prisma.hotel.update({
      where: { id },
      data: { isActive: false },
    });

    await logAudit({
      actor: req?.user?.userId ?? 'system',
      action: 'HOTEL_DELETED',
      resource: 'hotel',
      resourceId: id,
      before: { isActive: true, userCount },
      after: { isActive: false },
      metadata: { type: 'soft_delete', reason: 'has_active_users' },
    }, req);

    return { hotel: updated, hardDeleted: false };
  }

  // Hard delete: no active users
  await prisma.hotel.delete({ where: { id } });

  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'HOTEL_DELETED',
    resource: 'hotel',
    resourceId: id,
    before: { name: hotel.name, slug: hotel.slug },
    metadata: { type: 'hard_delete' },
  }, req);

  return { hardDeleted: true };
}

// =============================================================================
// REACTIVATE HOTEL (SUPER_ADMIN)
// =============================================================================
export async function reactivateHotel(id: string, req?: Request) {
  const hotel = await prisma.hotel.findUnique({ where: { id } });
  if (!hotel) throw new ApiError(404, 'Hôtel introuvable');

  const updated = await prisma.hotel.update({
    where: { id },
    data: { isActive: true },
  });

  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'HOTEL_UPDATED',
    resource: 'hotel',
    resourceId: id,
    after: { isActive: true },
    metadata: { type: 'reactivation' },
  }, req);

  return updated;
}
