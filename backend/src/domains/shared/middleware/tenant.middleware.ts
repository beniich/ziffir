import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { ApiError } from '../../../shared/errors/errorHandler.js';

export interface TenantContext {
  id: string;
  name: string;
  slug: string;
  plan: string;
  trialActive: boolean;
  trialExpired: boolean;
  trialDaysLeft: number | null;
  isActive: boolean;
}

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenant?: TenantContext;
      sessionId?: string;
    }
  }
}

const TRIAL_DURATION_DAYS = 14;

function computeTrialStatus(
  plan: string,
  trialEndsAt: Date | null
): { trialActive: boolean; trialExpired: boolean; trialDaysLeft: number | null } {
  if (plan !== 'FREE_TRIAL' || !trialEndsAt) {
    return { trialActive: false, trialExpired: false, trialDaysLeft: null };
  }
  
  const now = Date.now();
  const endsAt = trialEndsAt.getTime();
  const msLeft = endsAt - now;
  
  if (msLeft <= 0) {
    return { trialActive: false, trialExpired: true, trialDaysLeft: 0 };
  }
  
  return {
    trialActive: true,
    trialExpired: false,
    trialDaysLeft: Math.ceil(msLeft / 86400000),
  };
}

export const requireTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.sessionId) {
      return next(new ApiError(401, 'Authentification requise avant tenant'));
    }

    const session = await prisma.userSession.findUnique({
      where: { id: req.sessionId }
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return next(new ApiError(401, 'Session invalide ou expirée'));
    }

    const activeHotelId = session.activeHotelId;
    if (!activeHotelId) {
      return next(new ApiError(409, 'Aucun hôtel actif. Veuillez en sélectionner un.'));
    }

    const membership = await prisma.hotelMembership.findUnique({
      where: {
        userId_hotelId: {
          userId: req.user.id,
          hotelId: activeHotelId,
        },
      },
    });

    if (!membership && req.user.role !== 'SUPER_ADMIN') {
      return next(new ApiError(403, 'Vous n\'avez pas accès à cet hôtel.'));
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: activeHotelId },
    });

    if (!hotel) {
      return next(new ApiError(404, 'Hôtel introuvable'));
    }

    if (!hotel.isActive) {
      return next(new ApiError(403, 'Cet hôtel a été désactivé. Contactez le support.'));
    }

    const trialStatus = computeTrialStatus(hotel.plan, hotel.trialEndsAt);

    req.tenantId = hotel.id;
    req.tenant = {
      id: hotel.id,
      name: hotel.name,
      slug: hotel.slug,
      plan: hotel.plan,
      isActive: hotel.isActive,
      ...trialStatus,
    };

    next();
  } catch (e) {
    console.error('[tenant middleware]', e);
    next(new ApiError(500, 'Erreur serveur lors de la vérification du tenant'));
  }
};

export function tenantFilter<T extends Record<string, any>>(
  req: Request,
  baseWhere: T = {} as T
): T & { hotelId: string } {
  if (!req.tenantId) {
    throw new Error('tenantFilter() appelé sans requireTenant.');
  }
  return { ...baseWhere, hotelId: req.tenantId };
}

export async function createTrialHotel(
  userId: string,
  hotelName: string
): Promise<{ hotelId: string; trialEndsAt: Date }> {
  const slug = await generateUniqueSlug(hotelName);
  const trialEndsAt = new Date(Date.now() + TRIAL_DURATION_DAYS * 86400000);

  const result = await prisma.$transaction(async (tx) => {
    const hotel = await tx.hotel.create({
      data: {
        name: hotelName,
        address: '',
        city: '',
        country: '',
        slug,
        plan: 'FREE_TRIAL',
        trialEndsAt,
        isActive: true,
      },
    });

    await tx.hotelMembership.create({
      data: {
        userId,
        hotelId: hotel.id,
        role: 'OWNER',
      },
    });

    return hotel;
  });

  return { hotelId: result.id, trialEndsAt };
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  let slug = base || 'hotel';
  let suffix = 0;

  while (await prisma.hotel.findUnique({ where: { slug } })) {
    suffix++;
    slug = `${base}-${suffix}`;
  }

  return slug;
}

export function assertSameHotel(req: import('express').Request, targetHotelId: string) {
  if (req.user?.role === 'SUPER_ADMIN') return;
  if (req.user?.activeHotelId !== targetHotelId && req.user?.hotelId !== targetHotelId) {
    throw new (require('../../../shared/errors/errorHandler.js').ApiError)(403, 'Accès interdit : hôtel différent');
  }
}
