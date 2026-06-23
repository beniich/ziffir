"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalLimiter = exports.heavyLimiter = exports.readLimiter = exports.writeLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_1 = require("./redis");
const metrics_1 = require("../utils/metrics");
/**
 * Store Redis partagé pour tous les limiters.
 * Distribué : fonctionne sur plusieurs instances backend.
 */
const createRedisStore = (prefix, windowMs) => {
    return new rate_limit_redis_1.default({
        sendCommand: (...args) => redis_1.redis.call(...args),
        prefix: `rl:${prefix}:`,
        // windowMs est géré par le limiter lui-même dans les versions récentes
    });
};
// ════════════════════════════════════════════════════════════
// LIMITERS (avec Redis store)
// ════════════════════════════════════════════════════════════
const keyGenerator = (req) => {
    return req.user?.userId || req.ip || 'anonymous';
};
const rateLimitHandler = (req, res, name) => {
    metrics_1.rateLimitHits.inc({ limiter: name });
    res.status(429).json({
        success: false,
        error: 'Trop de requêtes. Réessayez dans quelques minutes.',
        retryAfter: res.getHeader('Retry-After'),
    });
};
// ─── Authentification : très restrictif ─────────────────────
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => rateLimitHandler(req, res, 'auth'),
    skipSuccessfulRequests: true,
    keyGenerator,
    store: createRedisStore('auth', 15 * 60 * 1000),
});
// ─── Endpoints d'écriture ───────────────────────────────────
exports.writeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => rateLimitHandler(req, res, 'write'),
    keyGenerator,
    store: createRedisStore('write', 60 * 1000),
});
// ─── Endpoints de lecture ───────────────────────────────────
exports.readLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => rateLimitHandler(req, res, 'read'),
    keyGenerator,
    store: createRedisStore('read', 60 * 1000),
});
// ─── Upload / opérations lourdes ───────────────────────────
exports.heavyLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => rateLimitHandler(req, res, 'heavy'),
    keyGenerator,
    store: createRedisStore('heavy', 60 * 60 * 1000),
});
// ─── Global : filet de sécurité ─────────────────────────────
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => rateLimitHandler(req, res, 'global'),
    keyGenerator: (req) => req.ip || 'anonymous',
    store: createRedisStore('global', 60 * 60 * 1000),
});
//# sourceMappingURL=rateLimit.js.map