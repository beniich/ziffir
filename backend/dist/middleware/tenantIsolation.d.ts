import { Request, Response, NextFunction } from 'express';
/**
 * Injecte automatiquement hotelId/userId selon le rôle.
 * Appliqué APRÈS requireAuth pour avoir accès à req.user.
 */
export declare const tenantIsolation: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=tenantIsolation.d.ts.map