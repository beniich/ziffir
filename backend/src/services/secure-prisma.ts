import { PrismaClient } from '@prisma/client';
import {
  PermissionsService,
  UserContext,
  Action,
  Subject,
} from './permissions.service';
// import { AppError } from '../middleware/errorHandler'; // We'll just throw Error for simplicity or define AppError
export class AppError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const prisma = new PrismaClient();

// ════════════════════════════════════════════════════════════
// WRAPPER GÉNÉRIQUE
// ════════════════════════════════════════════════════════════

function buildSecureDelegate(model: any, subject: Subject) {
  return {
    findMany: (ctx: UserContext, args: any = {}) => {
      PermissionsService.require(ctx, 'read', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      return model.findMany({ ...args, where: { ...filter, ...args.where } });
    },

    findUnique: (ctx: UserContext, id: string, args: any = {}) => {
      PermissionsService.require(ctx, 'read', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      return model.findFirst({
        ...args,
        where: { id, ...filter },
      });
    },

    findFirst: (ctx: UserContext, args: any = {}) => {
      PermissionsService.require(ctx, 'read', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      return model.findFirst({ ...args, where: { ...filter, ...args.where } });
    },

    count: (ctx: UserContext, args: any = {}) => {
      PermissionsService.require(ctx, 'read', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      return model.count({ ...args, where: { ...filter, ...args.where } });
    },

    create: (ctx: UserContext, args: any = {}) => {
      PermissionsService.require(ctx, 'create', subject);
      const data = args.data || {};
      const enrichedData = enforceHotelId(ctx, subject, data);
      return model.create({ ...args, data: enrichedData });
    },

    createMany: (ctx: UserContext, args: any = {}) => {
      PermissionsService.require(ctx, 'create', subject);
      const data = args.data || [];
      const enrichedData = Array.isArray(data) 
        ? data.map(d => enforceHotelId(ctx, subject, d))
        : enforceHotelId(ctx, subject, data);
      return model.createMany({ ...args, data: enrichedData });
    },

    update: (ctx: UserContext, id: string, data: any, args: any = {}) => {
      PermissionsService.require(ctx, 'update', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      // We must use updateMany to safely apply where with id and filter
      // But updateMany doesn't return the updated record.
      // So we find it first, or use update if id is unique enough.
      // We will do a double check here to prevent info leak:
      return model.updateMany({
        ...args,
        where: { id, ...filter },
        data,
      }).then(async (result: any) => {
         if (result.count === 0) throw new AppError(404, 'Non trouvé ou accès refusé');
         return model.findFirst({ where: { id } });
      });
    },

    updateMany: (ctx: UserContext, args: any) => {
      PermissionsService.require(ctx, 'update', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      return model.updateMany({ ...args, where: { ...filter, ...args.where } });
    },

    delete: (ctx: UserContext, id: string) => {
      PermissionsService.require(ctx, 'delete', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      return model.deleteMany({ where: { id, ...filter } });
    },

    deleteMany: (ctx: UserContext, args: any = {}) => {
      PermissionsService.require(ctx, 'delete', subject);
      const filter = PermissionsService.getPrismaFilter(ctx, subject);
      return model.deleteMany({ ...args, where: { ...filter, ...args.where } });
    },
  };
}

/**
 * Force l'injection de hotelId selon le rôle
 */
function enforceHotelId(ctx: UserContext, subject: Subject, data: any): any {
  const TENANT_SUBJECTS: Subject[] = [
    'Hotel', 'RoomOrder', 'Room', 'StaffMember',
    'SuiteControl', 'PricingRule', 'VaultDocument',
  ];

  if (!TENANT_SUBJECTS.includes(subject)) {
    return data;
  }

  if (ctx.role === 'SUPER_ADMIN') {
    if (!data.hotelId) {
      throw new AppError(400, 'hotelId requis pour cette opération');
    }
    return data;
  }

  if (ctx.role === 'HOTEL') {
    if (!ctx.hotelId) {
      throw new AppError(403, 'Compte hôtel sans hôtel associé');
    }
    return { ...data, hotelId: ctx.hotelId };
  }

  if (ctx.role === 'CLIENT') {
    if (subject === 'RoomOrder') {
      return { ...data, guestId: ctx.userId };
    }
    throw new AppError(403, 'Action non autorisée pour ce rôle');
  }

  throw new AppError(403, 'Rôle non autorisé');
}

export const securePrisma = {
  roomOrder:      buildSecureDelegate(prisma.roomOrder, 'RoomOrder'),
  room:           buildSecureDelegate(prisma.room, 'Room'),
  staff:          buildSecureDelegate(prisma.staffMember, 'StaffMember'),
  vault:          buildSecureDelegate(prisma.vaultDocument, 'VaultDocument'),
  suiteControl:   buildSecureDelegate(prisma.suiteControl, 'SuiteControl'),
  pricing:        buildSecureDelegate(prisma.pricingRule, 'PricingRule'),
  course:         buildSecureDelegate(prisma.course, 'Course'),
  hotel:          buildSecureDelegate(prisma.hotel, 'Hotel'),
  audit:          buildSecureDelegate(prisma.audit, 'AuditLog'),
  user:           buildSecureDelegate(prisma.user, 'User'),
};
