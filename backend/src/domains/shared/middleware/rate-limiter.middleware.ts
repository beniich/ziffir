import rateLimit, { type Options } from 'express-rate-limit';
import { env } from '../../../config/env.js';

const baseOptions: Partial<Options> = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Trust proxy is set at app level (app.set('trust proxy', 1))
};

/**
 * Limiter for authentication endpoints (login, register, password reset).
 * Prevents brute-force attacks. Very strict.
 */
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX,  // default 5 attempts
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  skipSuccessfulRequests: true,
});

/**
 * Limiter for invitation/registration endpoints.
 * Prevents mass spam invitations.
 */
export const invitationLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 20,
  message: { error: 'Limite d\'invitations atteinte. Réessayez plus tard.' },
});

/**
 * General API limiter (all endpoints).
 */
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: { error: 'Trop de requêtes. Réessayez plus tard.' },
});

/**
 * Strict limiter for sensitive operations (delete, role change, etc.)
 */
export const strictLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 30,
  message: { error: 'Limite atteinte pour cette opération.' },
});
