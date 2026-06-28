import type { Request } from 'express';

/**
 * Builds a Prisma where-clause fragment with hotel scoping.
 * - SUPER_ADMIN + no param → no hotelId filter (cross-hotel)
 * - SUPER_ADMIN + ?hotelId → filter by that hotel
 * - Any other role → filter by user's own hotelId
 */
export function buildTenantWhere(req: Request, extra: Record<string, unknown> = {}): Record<string, unknown> {
  if (!req.user) throw new Error('Non authentifié');

  if (req.user.role === 'SUPER_ADMIN') {
    const queryHotelId = req.query.hotelId as string | undefined;
    if (queryHotelId) {
      return { hotelId: queryHotelId, ...extra };
    }
    return extra; // No hotel filter
  }

  return { hotelId: req.user.hotelId, ...extra };
}

/**
 * Pour les routes 100% cross-hôtels (uniquement SUPER_ADMIN).
 */
export function requireCrossTenantContext(req: Request): { hotelIds: string[] | null } {
  if (req.user?.role !== 'SUPER_ADMIN') {
    throw new Error('Réservé aux super-admins');
  }
  return { hotelIds: null };
}

