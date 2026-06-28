import type { Request } from 'express';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export async function getTenantIdOrThrow(req: Request): Promise<string> {
  if (req.tenantId) return req.tenantId;

  if (req.sessionId) {
    const session = await prisma.userSession.findUnique({ where: { id: req.sessionId } });
    if (session?.activeHotelId) return session.activeHotelId;
  }

  if (req.user?.role !== 'SUPER_ADMIN') {
    if (!req.user) throw new Error('Non authentifié');
    return req.user.hotelId ?? '';
  }
  
  const queryHotelId = req.query.hotelId as string | undefined;
  if (queryHotelId) return queryHotelId;
  
  const firstHotel = await prisma.hotel.findFirst({ select: { id: true } });
  if (!firstHotel) throw new Error('Aucun hôtel configuré');
  return firstHotel.id;
}

export function getTenantId(req: Request): string {
  if (req.tenantId) return req.tenantId;

  if (!req.user) {
    throw new Error('User not authenticated');
  }
  if (req.user.role === 'SUPER_ADMIN') {
    const queryHotelId = req.query.hotelId as string | undefined;
    if (queryHotelId) return queryHotelId;
    throw new Error('SUPER_ADMIN doit spécifier ?hotelId= pour cette opération synchrone');
  }
  return req.user.hotelId ?? '';
}
