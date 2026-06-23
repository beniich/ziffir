"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffController = void 0;
const secure_prisma_1 = require("../services/secure-prisma");
// import { cacheService } from '../services/cache.service';
// import { broadcastUpdate } from '../websocket/ws.server';
// import { auditLogger } from '../utils/logger';
const errorHandler_1 = require("../middleware/errorHandler");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cacheService = { invalidatePattern: async (p) => { } };
const broadcastUpdate = (msg) => { };
const auditLogger = { info: console.log };
const CACHE_PREFIX = 'staff';
class StaffController {
    static async list(req, res) {
        try {
            const ctx = req.user;
            const staff = await secure_prisma_1.securePrisma.staff.findMany(ctx, {
                orderBy: { name: 'asc' },
            });
            const safe = staff.map(({ passwordHash, ...s }) => s);
            res.json({ success: true, data: safe });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async getById(req, res) {
        try {
            const ctx = req.user;
            const { id } = req.params;
            const member = await secure_prisma_1.securePrisma.staff.findUnique(ctx, id);
            if (!member)
                throw new errorHandler_1.AppError(404, 'Membre introuvable');
            const { passwordHash, ...safe } = member;
            res.json({ success: true, data: safe });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async create(req, res) {
        try {
            const ctx = req.user;
            const { name, email, username, password, role, department, clearanceLevel } = req.body;
            if (!name || !email || !username || !password) {
                throw new errorHandler_1.AppError(400, 'Champs requis: name, email, username, password');
            }
            const existing = await secure_prisma_1.securePrisma.user.findFirst(ctx, {
                where: { OR: [{ email }, { username }] },
            });
            if (existing)
                throw new errorHandler_1.AppError(409, 'Email ou username déjà utilisé');
            const passwordHash = await bcryptjs_1.default.hash(password, 12);
            const member = await secure_prisma_1.securePrisma.user.create(ctx, {
                data: {
                    email,
                    username,
                    passwordHash,
                    name,
                    role: 'HOTEL',
                    department,
                    clearanceLevel: clearanceLevel || 1,
                }
            });
            const { passwordHash: _, ...safe } = member;
            await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);
            broadcastUpdate({
                type: 'STAFF_CREATED',
                data: safe,
                hotelId: member.hotelId,
            });
            auditLogger.info({
                action: 'STAFF_CREATED',
                staffId: member.id,
                hotelId: member.hotelId,
                createdBy: ctx.userId,
            });
            res.status(201).json({ success: true, data: safe });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async update(req, res) {
        try {
            const ctx = req.user;
            const { id } = req.params;
            const updates = { ...req.body };
            delete updates.passwordHash;
            delete updates.hotelId;
            await secure_prisma_1.securePrisma.staff.update(ctx, id, updates);
            const updated = await secure_prisma_1.securePrisma.staff.findUnique(ctx, id);
            const { passwordHash, ...safe } = updated;
            await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);
            auditLogger.info({
                action: 'STAFF_UPDATED',
                staffId: id,
                hotelId: updated.hotelId,
                updatedBy: ctx.userId,
            });
            res.json({ success: true, data: safe });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async updateClearance(req, res) {
        try {
            const ctx = req.user;
            const { id } = req.params;
            const { clearanceLevel } = req.body;
            if (!clearanceLevel || clearanceLevel < 1 || clearanceLevel > 5) {
                throw new errorHandler_1.AppError(400, 'clearanceLevel entre 1 et 5');
            }
            await secure_prisma_1.securePrisma.staff.update(ctx, id, { clearanceLevel });
            auditLogger.info({
                action: 'STAFF_CLEARANCE_CHANGED',
                staffId: id,
                newLevel: clearanceLevel,
                changedBy: ctx.userId,
                role: ctx.role,
            });
            res.json({ success: true, message: 'Clearance mise à jour' });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async deactivate(req, res) {
        try {
            const ctx = req.user;
            const { id } = req.params;
            await secure_prisma_1.securePrisma.staff.update(ctx, id, { active: false });
            auditLogger.info({
                action: 'STAFF_DEACTIVATED',
                staffId: id,
                deactivatedBy: ctx.userId,
            });
            res.json({ success: true, message: 'Membre désactivé' });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.StaffController = StaffController;
//# sourceMappingURL=staff.controller.js.map