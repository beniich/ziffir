import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../services/auth.service';
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: UserRole;
                hotelId?: string | null;
            };
        }
    }
}
/**
 * Middleware : vérifie la présence et validité du JWT access token.
 */
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware : vérifie que l'utilisateur a l'un des rôles requis.
 */
export declare const requireRole: (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware : authentification optionnelle (ne bloque pas si pas de token).
 */
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map