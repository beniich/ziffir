import { Request, Response, NextFunction } from 'express';
export declare enum Role {
    USER = "USER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
/**
 * Middleware d'autorisation RBAC (Role-Based Access Control).
 * @param allowedRoles Liste des rôles autorisés à accéder à la ressource.
 */
export declare const requireRole: (allowedRoles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=permissions.d.ts.map