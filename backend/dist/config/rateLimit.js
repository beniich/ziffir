"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalLimiter = exports.heavyLimiter = exports.readLimiter = exports.writeLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
const metrics_1 = require("../utils/metrics");

const rateLimitHandler = (req, res, name) => {
    metrics_1.rateLimitHits.inc({ limiter: name });
    res.status(429).json({
        success: false,
        error: 'Trop de requêtes. Réessayez dans quelques minutes.',
        retryAfter: res.getHeader('Retry-After'),
    });
};

// ─── Authentification : très restrictif ─────────────────────
exports.authLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => rateLimitHandler(req, res, 'auth'),
    skipSuccessfulRequests: true,
    keyGenerator: (0, express_rate_limit_1.ipKeyGenerator),
});
// ─── Endpoints d'écriture ───────────────────────────────────
exports.writeLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => rateLimitHandler(req, res, 'write'),
    keyGenerator: (0, express_rate_limit_1.ipKeyGenerator),
});
// ─── Endpoints de lecture ───────────────────────────────────
exports.readLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => rateLimitHandler(req, res, 'read'),
    keyGenerator: (0, express_rate_limit_1.ipKeyGenerator),
});
// ─── Upload / opérations lourdes ───────────────────────────
exports.heavyLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => rateLimitHandler(req, res, 'heavy'),
    keyGenerator: (0, express_rate_limit_1.ipKeyGenerator),
});
// ─── Global : filet de sécurité ─────────────────────────────
exports.globalLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => rateLimitHandler(req, res, 'global'),
    keyGenerator: (0, express_rate_limit_1.ipKeyGenerator),
});