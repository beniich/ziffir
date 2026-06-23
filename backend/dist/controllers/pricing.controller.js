"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingController = void 0;
const secure_prisma_1 = require("../services/secure-prisma");
const cacheService = {
    invalidatePattern: async (p) => { },
    remember: async (key, fn, ttl) => fn()
};
const broadcastUpdate = (msg) => { };
const auditLogger = { info: console.log };
const CACHE_PREFIX = 'pricing';
class PricingController {
    static async list(req, res) {
        try {
            const ctx = req.user;
            const cacheKey = `${CACHE_PREFIX}:${ctx.hotelId}`;
            const rules = await cacheService.remember(cacheKey, () => secure_prisma_1.securePrisma.pricing.findMany(ctx, {
                orderBy: { suite: 'asc' },
            }), 120);
            res.json({ success: true, data: rules });
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
            const { basePrice, channelMultipliers, status } = req.body;
            const updates = {};
            if (basePrice !== undefined)
                updates.basePrice = basePrice;
            if (channelMultipliers !== undefined)
                updates.channelMultipliers = JSON.stringify(channelMultipliers);
            if (status !== undefined)
                updates.status = status;
            await secure_prisma_1.securePrisma.pricing.update(ctx, id, updates);
            await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);
            const updated = await secure_prisma_1.securePrisma.pricing.findUnique(ctx, id);
            broadcastUpdate({
                type: 'PRICING_UPDATED',
                data: updated,
                hotelId: updated.hotelId,
            });
            auditLogger.info({
                action: 'PRICING_RULE_UPDATED',
                ruleId: id,
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
    static async syncAll(req, res) {
        try {
            const ctx = req.user;
            const rules = await secure_prisma_1.securePrisma.pricing.findMany(ctx);
            for (const rule of rules) {
                await secure_prisma_1.securePrisma.pricing.update(ctx, rule.id, { status: 'pending' });
            }
            await new Promise((resolve) => setTimeout(resolve, 1500));
            for (const rule of rules) {
                await secure_prisma_1.securePrisma.pricing.update(ctx, rule.id, {
                    status: 'synced',
                    lastSync: new Date(),
                });
            }
            await cacheService.invalidatePattern(`${CACHE_PREFIX}:*`);
            auditLogger.info({
                action: 'PRICING_BULK_SYNC',
                count: rules.length,
                syncedBy: ctx.userId,
            });
            res.json({ success: true, message: `${rules.length} règles synchronisées` });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.PricingController = PricingController;
//# sourceMappingURL=pricing.controller.js.map