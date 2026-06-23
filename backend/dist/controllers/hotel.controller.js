"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelController = void 0;
const secure_prisma_1 = require("../services/secure-prisma");
// import { cacheService } from '../services/cache.service';
// import { auditLogger } from '../utils/logger';
const errorHandler_1 = require("../middleware/errorHandler");
const permissions_service_1 = require("../services/permissions.service");
const auditLogger = { info: console.log };
class HotelController {
    static async list(req, res) {
        try {
            const ctx = req.user;
            permissions_service_1.PermissionsService.require(ctx, 'read', 'Hotel');
            const hotels = await secure_prisma_1.securePrisma.hotel.findMany(ctx, {
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: hotels });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async create(req, res) {
        try {
            const ctx = req.user;
            permissions_service_1.PermissionsService.require(ctx, 'create', 'Hotel');
            const { name, slug, city, address, phone } = req.body;
            if (!name || !slug) {
                throw new errorHandler_1.AppError(400, 'name et slug requis');
            }
            const existing = await secure_prisma_1.securePrisma.hotel.findFirst(ctx, {
                where: { slug },
            });
            if (existing)
                throw new errorHandler_1.AppError(409, 'Slug déjà utilisé');
            const hotel = await secure_prisma_1.securePrisma.hotel.create(ctx, {
                data: {
                    name,
                    slug,
                    city,
                    address,
                    phone,
                    isActive: true,
                }
            });
            auditLogger.info({
                action: 'HOTEL_CREATED',
                hotelId: hotel.id,
                createdBy: ctx.userId,
            });
            res.status(201).json({ success: true, data: hotel });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async update(req, res) {
        try {
            const ctx = req.user;
            permissions_service_1.PermissionsService.require(ctx, 'update', 'Hotel');
            const { id } = req.params;
            const updates = { ...req.body };
            delete updates.slug;
            await secure_prisma_1.securePrisma.hotel.update(ctx, id, updates);
            const updated = await secure_prisma_1.securePrisma.hotel.findUnique(ctx, id);
            auditLogger.info({
                action: 'HOTEL_UPDATED',
                hotelId: id,
                changes: Object.keys(updates),
                updatedBy: ctx.userId,
            });
            res.json({ success: true, data: updated });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async deactivate(req, res) {
        try {
            const ctx = req.user;
            permissions_service_1.PermissionsService.require(ctx, 'delete', 'Hotel');
            const { id } = req.params;
            await secure_prisma_1.securePrisma.hotel.update(ctx, id, { isActive: false });
            auditLogger.info({
                action: 'HOTEL_DEACTIVATED',
                hotelId: id,
                deactivatedBy: ctx.userId,
            });
            res.json({ success: true, message: 'Hôtel désactivé' });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.HotelController = HotelController;
//# sourceMappingURL=hotel.controller.js.map