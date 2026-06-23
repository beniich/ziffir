"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlsController = void 0;
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
const CACHE_PREFIX = 'suite-controls';
class ControlsController {
    static async list(req, res) {
        try {
            const ctx = req.user;
            const cacheKey = `${CACHE_PREFIX}:${ctx.hotelId}`;
            const controls = await cacheService.remember(cacheKey, () => secure_prisma_1.securePrisma.suiteControl.findMany(ctx, {
                orderBy: { room: { number: 'asc' } },
                include: { room: true },
            }), 30);
            res.json({ success: true, data: controls });
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
            const updates = req.body;
            const allowed = {};
            const ALLOWED_FIELDS = ['lights', 'climate', 'curtains', 'music', 'musicVolume', 'doNotDisturb'];
            for (const field of ALLOWED_FIELDS) {
                if (field in updates)
                    allowed[field] = updates[field];
            }
            if (Object.keys(allowed).length === 0) {
                throw new errorHandler_1.AppError(400, 'Aucun champ valide fourni');
            }
            const existing = await secure_prisma_1.securePrisma.suiteControl.findUnique(ctx, id);
            if (!existing)
                throw new errorHandler_1.AppError(404, 'Suite introuvable');
            await secure_prisma_1.securePrisma.suiteControl.update(ctx, id, allowed);
            const updated = await secure_prisma_1.securePrisma.suiteControl.findUnique(ctx, id);
            await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);
            broadcastUpdate({
                type: 'SUITE_CONTROL_CHANGED',
                data: updated,
                hotelId: updated.hotelId,
            });
            auditLogger.info({
                action: 'SUITE_CONTROL_UPDATED',
                controlId: id,
                changes: allowed,
                updatedBy: ctx.userId,
            });
            res.json({ success: true, data: updated });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.ControlsController = ControlsController;
//# sourceMappingURL=controls.controller.js.map