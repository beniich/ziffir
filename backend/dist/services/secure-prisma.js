"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securePrisma = exports.AppError = void 0;
const client_1 = require("@prisma/client");
const permissions_service_1 = require("./permissions.service");
// import { AppError } from '../middleware/errorHandler'; // We'll just throw Error for simplicity or define AppError
class AppError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
const prisma = new client_1.PrismaClient();
// ════════════════════════════════════════════════════════════
// WRAPPER GÉNÉRIQUE
// ════════════════════════════════════════════════════════════
function buildSecureDelegate(model, subject) {
    return {
        findMany: (ctx, args = {}) => {
            permissions_service_1.PermissionsService.require(ctx, 'read', subject);
            const filter = permissions_service_1.PermissionsService.getPrismaFilter(ctx, subject);
            return model.findMany({ ...args, where: { ...filter, ...args.where } });
        },
        findUnique: (ctx, id, args = {}) => {
            permissions_service_1.PermissionsService.require(ctx, 'read', subject);
            const filter = permissions_service_1.PermissionsService.getPrismaFilter(ctx, subject);
            return model.findFirst({
                ...args,
                where: { id, ...filter },
            });
        },
        findFirst: (ctx, args = {}) => {
            permissions_service_1.PermissionsService.require(ctx, 'read', subject);
            const filter = permissions_service_1.PermissionsService.getPrismaFilter(ctx, subject);
            return model.findFirst({ ...args, where: { ...filter, ...args.where } });
        },
        count: (ctx, args = {}) => {
            permissions_service_1.PermissionsService.require(ctx, 'read', subject);
            const filter = permissions_service_1.PermissionsService.getPrismaFilter(ctx, subject);
            return model.count({ ...args, where: { ...filter, ...args.where } });
        },
        create: (ctx, args = {}) => {
            permissions_service_1.PermissionsService.require(ctx, 'create', subject);
            const data = args.data || {};
            const enrichedData = enforceHotelId(ctx, subject, data);
            return model.create({ ...args, data: enrichedData });
        },
        createMany: (ctx, args = {}) => {
            permissions_service_1.PermissionsService.require(ctx, 'create', subject);
            const data = args.data || [];
            const enrichedData = Array.isArray(data)
                ? data.map(d => enforceHotelId(ctx, subject, d))
                : enforceHotelId(ctx, subject, data);
            return model.createMany({ ...args, data: enrichedData });
        },
        update: (ctx, id, data, args = {}) => {
            permissions_service_1.PermissionsService.require(ctx, 'update', subject);
            const filter = permissions_service_1.PermissionsService.getPrismaFilter(ctx, subject);
            // We must use updateMany to safely apply where with id and filter
            // But updateMany doesn't return the updated record.
            // So we find it first, or use update if id is unique enough.
            // We will do a double check here to prevent info leak:
            return model.updateMany({
                ...args,
                where: { id, ...filter },
                data,
            }).then(async (result) => {
                if (result.count === 0)
                    throw new AppError(404, 'Non trouvé ou accès refusé');
                return model.findFirst({ where: { id } });
            });
        },
        updateMany: (ctx, args) => {
            permissions_service_1.PermissionsService.require(ctx, 'update', subject);
            const filter = permissions_service_1.PermissionsService.getPrismaFilter(ctx, subject);
            return model.updateMany({ ...args, where: { ...filter, ...args.where } });
        },
        delete: (ctx, id) => {
            permissions_service_1.PermissionsService.require(ctx, 'delete', subject);
            const filter = permissions_service_1.PermissionsService.getPrismaFilter(ctx, subject);
            return model.deleteMany({ where: { id, ...filter } });
        },
        deleteMany: (ctx, args = {}) => {
            permissions_service_1.PermissionsService.require(ctx, 'delete', subject);
            const filter = permissions_service_1.PermissionsService.getPrismaFilter(ctx, subject);
            return model.deleteMany({ ...args, where: { ...filter, ...args.where } });
        },
    };
}
/**
 * Force l'injection de hotelId selon le rôle
 */
function enforceHotelId(ctx, subject, data) {
    const TENANT_SUBJECTS = [
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
exports.securePrisma = {
    roomOrder: buildSecureDelegate(prisma.roomOrder, 'RoomOrder'),
    room: buildSecureDelegate(prisma.room, 'Room'),
    staff: buildSecureDelegate(prisma.staffMember, 'StaffMember'),
    vault: buildSecureDelegate(prisma.vaultDocument, 'VaultDocument'),
    suiteControl: buildSecureDelegate(prisma.suiteControl, 'SuiteControl'),
    pricing: buildSecureDelegate(prisma.pricingRule, 'PricingRule'),
    course: buildSecureDelegate(prisma.course, 'Course'),
    hotel: buildSecureDelegate(prisma.hotel, 'Hotel'),
    audit: buildSecureDelegate(prisma.audit, 'AuditLog'),
    user: buildSecureDelegate(prisma.user, 'User'),
};
//# sourceMappingURL=secure-prisma.js.map