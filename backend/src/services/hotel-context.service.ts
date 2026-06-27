import { prisma } from '../server';
import { AppError } from '../middleware/errorHandler';

export class HotelContextService {
  static async listAccessibleHotels(userId: string) {
    return prisma.membership.findMany({
      where: { userId, isActive: true },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  static async switchActiveHotel(userId: string, sessionId: string, hotelId: string): Promise<{ activeHotel: any }> {
    const membership = await prisma.membership.findUnique({
      where: { userId_hotelId: { userId, hotelId } },
      include: { hotel: true },
    });

    if (!membership || !membership.isActive) {
      throw new AppError(403, 'Vous n\'avez pas accès à cet hôtel');
    }

    if (!membership.hotel.isActive) {
      throw new AppError(403, 'Cet hôtel est désactivé');
    }

    await prisma.userSession.update({
      where: { id: sessionId },
      data: { activeHotelId: hotelId, lastUsedAt: new Date() },
    });

    await prisma.membership.update({
      where: { id: membership.id },
      data: { lastActiveAt: new Date() },
    });

    return {
      activeHotel: {
        id: membership.hotel.id,
        name: membership.hotel.name,
        slug: membership.hotel.slug,
        role: membership.hotelRole,
      },
    };
  }

  static async getEffectivePermissions(
    userId: string,
    hotelId: string
  ): Promise<{
    role: string;
    permissions: Set<string>;
    customPermissions: Record<string, boolean>;
  }> {
    const membership = await prisma.membership.findUnique({
      where: { userId_hotelId: { userId, hotelId } },
    });

    if (!membership) {
      return { role: 'NONE', permissions: new Set(), customPermissions: {} };
    }

    const basePermissions = ROLE_PERMISSIONS[membership.hotelRole] || [];
    const custom = (membership.customPermissions as Record<string, boolean>) || {};
    const effective = new Set(basePermissions);

    Object.entries(custom).forEach(([perm, allowed]) => {
      if (allowed) effective.add(perm);
      else effective.delete(perm);
    });

    return {
      role: membership.hotelRole,
      permissions: effective,
      customPermissions: custom,
    };
  }
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: [
    'hotel.update', 'hotel.delete',
    'staff.read', 'staff.create', 'staff.update', 'staff.delete',
    'order.read', 'order.create', 'order.update', 'order.delete',
    'room.read', 'room.create', 'room.update', 'room.delete',
    'analytics.read', 'audit.read',
    'billing.read', 'billing.manage',
    'settings.read', 'settings.update',
  ],
  ADMIN: [
    'staff.read', 'staff.create', 'staff.update',
    'order.read', 'order.update',
    'room.read', 'room.update',
    'analytics.read', 'audit.read',
    'settings.read', 'settings.update',
  ],
  MANAGER: [
    'staff.read',
    'order.read', 'order.create', 'order.update',
    'room.read', 'room.update',
    'analytics.read',
  ],
  STAFF: [
    'order.read', 'order.update',
    'room.read',
  ],
  VIEWER: [
    'order.read', 'room.read',
  ],
};
