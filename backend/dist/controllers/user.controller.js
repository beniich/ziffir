"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const secure_prisma_1 = require("../services/secure-prisma");
const permissions_service_1 = require("../services/permissions.service");
const auditLogger = { info: console.log };
class UserController {
    static async list(req, res) {
        try {
            const ctx = req.user;
            permissions_service_1.PermissionsService.require(ctx, 'read', 'User');
            const { role, hotelId, search } = req.query;
            const users = await secure_prisma_1.securePrisma.user.findMany(ctx, {
                where: {
                    ...(role && { role: role }),
                    ...(hotelId && { hotelId: hotelId }),
                    ...(search && {
                        OR: [
                            { email: { contains: search, mode: 'insensitive' } },
                            { username: { contains: search, mode: 'insensitive' } },
                        ],
                    }),
                },
                orderBy: { createdAt: 'desc' },
            });
            const safe = users.map(({ passwordHash, refreshToken, failedAttempts, lockedUntil, ...u }) => u);
            res.json({ success: true, data: safe });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async update(req, res) {
        try {
            const ctx = req.user;
            permissions_service_1.PermissionsService.require(ctx, 'update', 'User');
            const { id } = req.params;
            const updates = { ...req.body };
            delete updates.passwordHash;
            delete updates.refreshToken;
            await secure_prisma_1.securePrisma.user.update(ctx, id, updates);
            auditLogger.info({
                action: 'USER_UPDATED',
                userId: id,
                changes: Object.keys(updates),
                updatedBy: ctx.userId,
            });
            res.json({ success: true, message: 'Utilisateur mis à jour' });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async deactivate(req, res) {
        try {
            const ctx = req.user;
            permissions_service_1.PermissionsService.require(ctx, 'delete', 'User');
            const { id } = req.params;
            await secure_prisma_1.securePrisma.user.update(ctx, id, {
                isActive: false,
                refreshToken: null,
            });
            auditLogger.info({
                action: 'USER_DEACTIVATED',
                userId: id,
                deactivatedBy: ctx.userId,
            });
            res.json({ success: true, message: 'Utilisateur désactivé' });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map