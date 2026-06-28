/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type JwtPayload } from './jwt.js';
import { COOKIE_NAME } from '../../../utils/cookies.js';

// Étend le type Request pour inclure l'utilisateur authentifié
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string };
      tenantScope?: string | null;
      sessionId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.[COOKIE_NAME];

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { ...payload, id: payload.userId };
    req.sessionId = payload.sessionId;
    req.tenantScope = payload.role === 'SUPER_ADMIN' ? null : (payload.activeHotelId ?? payload.hotelId ?? null);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

export function requireRole(...allowedRoles: Array<JwtPayload['role']>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // SUPER_ADMIN bypass
    if (req.user.role === 'SUPER_ADMIN') return next();

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Réservé aux super-administrateurs' });
  }
  next();
}

export function resolveHotelScope(req: Request): string | null {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return req.user?.hotelId ?? null;
  }
  const queryHotelId = req.query.hotelId as string | undefined;
  return queryHotelId ?? null;
}

export function attachUser(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.[COOKIE_NAME];

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { ...payload, id: payload.userId };
      req.sessionId = payload.sessionId;
      req.tenantScope = payload.role === 'SUPER_ADMIN' ? null : (payload.activeHotelId ?? payload.hotelId ?? null);
    } catch {
      // Ignorer l'erreur ou ne rien faire si invalide, attachUser ne bloque pas
    }
  }
  next();
}
