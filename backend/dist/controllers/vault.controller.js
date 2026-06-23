"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultController = void 0;
const secure_prisma_1 = require("../services/secure-prisma");
// import { cacheService } from '../services/cache.service';
// import { broadcastUpdate } from '../websocket/ws.server';
// import { auditLogger } from '../utils/logger';
const errorHandler_1 = require("../middleware/errorHandler");
const cacheService = {
    invalidatePattern: async (p) => { },
    remember: async (key, fn, ttl) => fn()
};
const broadcastUpdate = (msg) => { };
const auditLogger = { info: console.log };
const CACHE_PREFIX = 'vault';
class VaultController {
    static async list(req, res) {
        try {
            const ctx = req.user;
            const cacheKey = `${CACHE_PREFIX}:${ctx.hotelId}:${ctx.userId}`;
            const docs = await cacheService.remember(cacheKey, async () => {
                return secure_prisma_1.securePrisma.vault.findMany(ctx, {
                    where: { withdrawnAt: null },
                    orderBy: { depositDate: 'desc' },
                });
            }, 60);
            res.json({ success: true, data: docs });
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
            const doc = await secure_prisma_1.securePrisma.vault.findUnique(ctx, id);
            if (!doc)
                throw new errorHandler_1.AppError(404, 'Document introuvable');
            res.json({ success: true, data: doc });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async deposit(req, res) {
        try {
            const ctx = req.user;
            const { name, category, owner, room, fingerprint } = req.body;
            if (!name || !category || !owner || !room) {
                throw new errorHandler_1.AppError(400, 'Champs requis: name, category, owner, room');
            }
            const docRef = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            const doc = await secure_prisma_1.securePrisma.vault.create(ctx, {
                data: {
                    docRef,
                    name,
                    category,
                    owner,
                    room,
                    fingerprint: fingerprint ?? true,
                    depositDate: new Date(),
                }
            });
            await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);
            broadcastUpdate({
                type: 'VAULT_DOC_ADDED',
                data: doc,
                hotelId: doc.hotelId,
            });
            auditLogger.info({
                action: 'VAULT_DOC_DEPOSITED',
                docId: doc.id,
                owner,
                room,
                hotelId: doc.hotelId,
                depositedBy: ctx.userId,
            });
            res.status(201).json({ success: true, data: doc });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async withdraw(req, res) {
        try {
            const ctx = req.user;
            const { id } = req.params;
            const existing = await secure_prisma_1.securePrisma.vault.findUnique(ctx, id);
            if (!existing)
                throw new errorHandler_1.AppError(404, 'Document introuvable');
            if (existing.withdrawnAt)
                throw new errorHandler_1.AppError(400, 'Document déjà retiré');
            await secure_prisma_1.securePrisma.vault.update(ctx, id, {
                withdrawnAt: new Date(),
            });
            await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);
            broadcastUpdate({
                type: 'VAULT_DOC_WITHDRAWN',
                data: { id, owner: existing.owner, room: existing.room },
                hotelId: existing.hotelId,
            });
            auditLogger.info({
                action: 'VAULT_DOC_WITHDRAWN',
                docId: id,
                owner: existing.owner,
                withdrawnBy: ctx.userId,
                role: ctx.role,
            });
            res.json({ success: true, message: 'Document retiré' });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.VaultController = VaultController;
//# sourceMappingURL=vault.controller.js.map