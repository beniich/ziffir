import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AccessTokenPayload } from '../domains/auth/auth.service';

const COOKIE_NAMES = {
  ACCESS: 'zafir_access_token',
  REFRESH: 'zafir_refresh_token',
} as const;

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[COOKIE_NAMES.ACCESS];
    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: 'Non authentifié', code: 'AUTH_REQUIRED' },
      });
      return;
    }
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as AccessTokenPayload;
    
    const session = await prisma.userSession.findUnique({
      where: { id: decoded.sessionId },
    });
    
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      res.clearCookie(COOKIE_NAMES.ACCESS, { path: '/' });
      res.clearCookie(COOKIE_NAMES.REFRESH, { path: '/' });
      res.status(401).json({
        success: false,
        error: { message: 'Session invalide', code: 'SESSION_INVALID' },
      });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, isActive: true, role: true },
    });
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { message: 'Compte désactivé', code: 'ACCOUNT_DISABLED' },
      });
      return;
    }
    
    req.auth = decoded;
    
    // Update lastSeenAt (async, non bloquant)
    prisma.userSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    }).catch(() => {});
    
    next();
  } catch (e) {
    res.status(401).json({
      success: false,
      error: { message: 'Token invalide', code: 'INVALID_TOKEN' },
    });
    return;
  }
}

export function requirePermission(...required: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        error: { message: 'Non authentifié' },
      });
    }
    
    if (!req.auth.activeHotelId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Aucun hôtel actif', code: 'NO_ACTIVE_HOTEL' },
      });
    }
    
    // Récupère les permissions effectives via la membership
    const { prisma } = await import('../lib/prisma');
    const membership = await prisma.hotelMembership.findFirst({
      where: {
        userId: req.auth.sub,
        hotelId: req.auth.activeHotelId,
        isActive: true,
        removedAt: null,
      },
    });
    
    if (!membership) {
      return res.status(403).json({
        success: false,
        error: { message: 'Accès refusé à cet hôtel' },
      });
    }
    
    const { authService } = await import('../domains/auth/auth.service');
    let parsedPerms: string[] = [];
    try {
      parsedPerms = JSON.parse(membership.permissions || '[]');
    } catch(e) {
      parsedPerms = [];
    }
    const permissions = authService.computePermissions(membership.role, parsedPerms);
    
    const hasAll = required.every(p => authService.hasPermission(permissions, p));
    
    if (!hasAll) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Permissions insuffisantes (besoin: ${required.join(', ')})`,
          code: 'INSUFFICIENT_PERMISSIONS',
          required,
        },
      });
    }
    
    next();
  };
}
