"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const secure_prisma_1 = require("../services/secure-prisma");
// import { cacheService } from '../services/cache.service';
// import { auditLogger } from '../utils/logger';
const errorHandler_1 = require("../middleware/errorHandler");
const crypto_1 = __importDefault(require("crypto"));
const metrics_1 = require("../utils/metrics");
const auditLogger = { info: console.log };
const CACHE_PREFIX = 'audits';
class AuditController {
    static async list(req, res) {
        try {
            const ctx = req.user;
            const limit = Math.min(parseInt(req.query.limit) || 100, 500);
            const audits = await secure_prisma_1.securePrisma.audit.findMany(ctx, {
                orderBy: { timestamp: 'desc' },
                take: limit,
            });
            res.json({ success: true, data: audits });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async create(req, res) {
        try {
            const ctx = req.user;
            const { action, reason, status } = req.body;
            if (!action || !reason || !status) {
                throw new errorHandler_1.AppError(400, 'Champs requis: action, reason, status');
            }
            if (!['AUTHORIZED', 'BYPASS', 'RESTRICTED_ATTEMPT'].includes(status)) {
                throw new errorHandler_1.AppError(400, 'Status invalide');
            }
            const lastAudit = await secure_prisma_1.securePrisma.audit.findFirst(ctx, {
                orderBy: { timestamp: 'desc' },
            });
            const previousHash = lastAudit?.hash ?? '0'.repeat(64);
            const logId = `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            const hashInput = `${logId}|${previousHash}|${action}|${ctx.userId}|${reason}`;
            const hash = crypto_1.default.createHash('sha256').update(hashInput).digest('hex');
            const audit = await secure_prisma_1.securePrisma.audit.create(ctx, {
                data: {
                    logId,
                    userId: ctx.userId,
                    userName: ctx.role,
                    hotelId: ctx.hotelId,
                    action,
                    reason,
                    previousHash,
                    hash,
                    status,
                    timestamp: new Date(),
                }
            });
            auditLogger.info({
                action: 'AUDIT_CREATED',
                auditId: audit.id,
                actionType: action,
                status,
                userId: ctx.userId,
            });
            res.status(201).json({ success: true, data: audit });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async verify(req, res) {
        try {
            const ctx = req.user;
            const audits = await secure_prisma_1.securePrisma.audit.findMany(ctx, {
                orderBy: { timestamp: 'asc' },
            });
            let valid = true;
            let brokenAt;
            for (let i = 0; i < audits.length; i++) {
                const current = audits[i];
                const expectedPrevious = i === 0 ? '0'.repeat(64) : audits[i - 1].hash;
                const hashInput = `${current.logId}|${current.previousHash}|${current.action}|${current.userId}|${current.reason}`;
                const recomputedHash = crypto_1.default.createHash('sha256').update(hashInput).digest('hex');
                if (current.hash !== recomputedHash || current.previousHash !== expectedPrevious) {
                    valid = false;
                    brokenAt = i;
                    break;
                }
            }
            metrics_1.auditChainValid.set(valid ? 1 : 0);
            res.json({
                success: true,
                data: {
                    valid,
                    total: audits.length,
                    brokenAt,
                    hotelId: ctx.hotelId,
                },
            });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.AuditController = AuditController;
//# sourceMappingURL=audit.controller.js.map