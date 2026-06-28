import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../../shared/errors/errorHandler.js';
import { logAudit } from '../../audit/audit.service.js';

export type Permission =
  | 'rooms:read' | 'rooms:create' | 'rooms:edit' | 'rooms:delete'
  | 'reservations:read' | 'reservations:create' | 'reservations:edit' | 'reservations:delete'
  | 'reservations:checkIn' | 'reservations:checkOut' | 'reservations:cancel'
  | 'invoices:read' | 'invoices:create' | 'invoices:edit' | 'invoices:refund' | 'invoices:delete'
  | 'users:read' | 'users:create' | 'users:edit' | 'users:delete'
  | 'housekeeping:read' | 'housekeeping:edit'
  | 'channels:read' | 'channels:manage'
  | 'billing:read' | 'billing:manage'
  | 'audit:read'
  | 'export:data' | 'hotel:delete' | 'settings:manage';

export type Role = 'STAFF' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

const PERMISSIONS_BY_ROLE: Record<Role, Permission[]> = {
  STAFF: [
    'rooms:read',
    'reservations:read', 'reservations:create', 'reservations:edit',
    'reservations:checkIn', 'reservations:checkOut',
    'housekeeping:read', 'housekeeping:edit',
  ],
  MANAGER: [
    'rooms:read', 'rooms:create', 'rooms:edit', 'rooms:delete',
    'reservations:read', 'reservations:create', 'reservations:edit',
    'reservations:checkIn', 'reservations:checkOut', 'reservations:cancel',
    'reservations:delete',
    'invoices:read', 'invoices:create', 'invoices:edit', 'invoices:refund',
    'users:read', 'users:create', 'users:edit',
    'channels:read', 'channels:manage',
    'export:data',
  ],
  ADMIN: [
    'rooms:read', 'rooms:create', 'rooms:edit', 'rooms:delete',
    'reservations:read', 'reservations:create', 'reservations:edit',
    'reservations:checkIn', 'reservations:checkOut', 'reservations:cancel',
    'reservations:delete',
    'invoices:read', 'invoices:create', 'invoices:edit', 'invoices:refund', 'invoices:delete',
    'users:read', 'users:create', 'users:edit', 'users:delete',
    'housekeeping:read', 'housekeeping:edit',
    'channels:read', 'channels:manage',
    'billing:read', 'billing:manage',
    'audit:read',
    'settings:manage',
    'export:data',
  ],
  SUPER_ADMIN: [
    'rooms:read', 'rooms:create', 'rooms:edit', 'rooms:delete',
    'reservations:read', 'reservations:create', 'reservations:edit',
    'reservations:checkIn', 'reservations:checkOut', 'reservations:cancel',
    'reservations:delete',
    'invoices:read', 'invoices:create', 'invoices:edit', 'invoices:refund', 'invoices:delete',
    'users:read', 'users:create', 'users:edit', 'users:delete',
    'housekeeping:read', 'housekeeping:edit',
    'channels:read', 'channels:manage',
    'billing:read', 'billing:manage',
    'audit:read',
    'settings:manage',
    'export:data',
    'hotel:delete',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS_BY_ROLE[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: Role): Permission[] {
  return PERMISSIONS_BY_ROLE[role] ?? [];
}

export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }
    
    const userRole = req.user.role as Role;
    
    if (!hasPermission(userRole, permission)) {
      // Log access denial
      await logAudit({
        actor: req.user.userId,
        action: 'rbac.access_denied',
        resource: req.path,
        metadata: {
          required: permission,
          actual: userRole,
          method: req.method,
        },
      }, req);
      
      throw new ApiError(403, `Forbidden: requires '${permission}'`);
    }
    
    next();
  };
}

export function requireAnyPermission(...permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError(401, 'Not authenticated');
    
    const userRole = req.user.role as Role;
    const has = permissions.some(p => hasPermission(userRole, p));
    
    if (!has) {
      throw new ApiError(403, `Forbidden: requires one of [${permissions.join(', ')}]`);
    }
    
    next();
  };
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError(401, 'Not authenticated');
    if (!roles.includes(req.user.role as Role)) {
      throw new ApiError(403, `Forbidden: role must be one of [${roles.join(', ')}]`);
    }
    next();
  };
}
