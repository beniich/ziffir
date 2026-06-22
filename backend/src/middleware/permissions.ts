import { Request, Response, NextFunction } from 'express';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

/**
 * Middleware d'autorisation RBAC (Role-Based Access Control).
 * @param allowedRoles Liste des rôles autorisés à accéder à la ressource.
 */
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user || !user.role) {
      res.status(401).json({ success: false, error: 'Non authentifié ou rôle introuvable.' });
      return;
    }

    if (!allowedRoles.includes(user.role as Role)) {
      res.status(403).json({ success: false, error: 'Accès refusé. Privilèges insuffisants.' });
      return;
    }

    next();
  };
};
