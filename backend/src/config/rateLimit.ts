import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Request, Response } from 'express';
import { redis } from './redis';
import { rateLimitHits } from '../utils/metrics';

/**
 * Store Redis partagé pour tous les limiters.
 * Distribué : fonctionne sur plusieurs instances backend.
 */
const createRedisStore = (prefix: string, windowMs: number) => {
  return new RedisStore({
    sendCommand: (...args: string[]) => (redis as any).call(...(args as [string, ...string[]])) as any,
    prefix: `rl:${prefix}:`,
    // windowMs est géré par le limiter lui-même dans les versions récentes
  });
};

// ════════════════════════════════════════════════════════════
// LIMITERS (avec Redis store)
// ════════════════════════════════════════════════════════════

const keyGenerator = (req: Request): string => {
  return (req as any).user?.userId || req.ip || 'anonymous';
};

const rateLimitHandler = (req: Request, res: Response, name: string): void => {
  rateLimitHits.inc({ limiter: name });
  res.status(429).json({
    success: false,
    error: 'Trop de requêtes. Réessayez dans quelques minutes.',
    retryAfter: res.getHeader('Retry-After'),
  });
};

// ─── Authentification : très restrictif ─────────────────────
export const authLimiter: RateLimitRequestHandler = rateLimit({
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
export const writeLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => rateLimitHandler(req, res, 'write'),
  keyGenerator,
  store: createRedisStore('write', 60 * 1000),
});

// ─── Endpoints de lecture ───────────────────────────────────
export const readLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => rateLimitHandler(req, res, 'read'),
  keyGenerator,
  store: createRedisStore('read', 60 * 1000),
});

// ─── Upload / opérations lourdes ───────────────────────────
export const heavyLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => rateLimitHandler(req, res, 'heavy'),
  keyGenerator,
  store: createRedisStore('heavy', 60 * 60 * 1000),
});

// ─── Global : filet de sécurité ─────────────────────────────
export const globalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => rateLimitHandler(req, res, 'global'),
  keyGenerator: (req) => req.ip || 'anonymous',
  store: createRedisStore('global', 60 * 60 * 1000),
});
