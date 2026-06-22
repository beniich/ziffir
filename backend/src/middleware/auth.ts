import { Request, Response, NextFunction } from 'express';
import { AuthService, UserRole } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: UserRole; hotelId?: string | null };
    }
  }
}

/**
 * Middleware : vérifie la présence et validité du JWT access token.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Token d\'authentification requis',
    });
    return;
  }

  const token = header.substring(7);

  try {
    const decoded = AuthService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
};

/**
 * Middleware : vérifie que l'utilisateur a l'un des rôles requis.
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Accès refusé. Rôles requis: ${roles.join(', ')}. Rôle actuel: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware : authentification optionnelle (ne bloque pas si pas de token).
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const decoded = AuthService.verifyAccessToken(header.substring(7));
      req.user = decoded;
    } catch {
      // Silencieux : optionnel
    }
  }
  next();
};
