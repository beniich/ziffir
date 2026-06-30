import { Request, Response, NextFunction } from 'express';
import { SecurityRole } from './types.js';

// Hierarchy map: higher number means higher clearance
const ROLE_HIERARCHY: Record<SecurityRole, number> = {
  'guest': 0,
  'client': 1,
  'operator': 4,
  'manager': 5, // Proprietor L5
  'sovereign_member': 6,
  'system_admin': 10
};

/**
 * RBAC Middleware Factory
 * Checks if the user's role has a clearance level >= to the required role.
 */
export const requireClearance = (requiredRole: SecurityRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Identity missing.' });
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      console.warn(`[RBAC] Access denied for ${req.user.userId}. Has ${req.user.role}, needs ${requiredRole}.`);
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Security Node Clearance Insufficient.',
        requiredLevel: requiredRole,
        currentLevel: req.user.role
      });
    }

    next();
  };
};
