import { Request, Response, NextFunction } from 'express';
/**
 * Middleware d'Audit Trail.
 * Enregistre les actions sensibles (mutations) pour des raisons de conformité et sécurité.
 */
export declare const auditTrail: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auditTrail.d.ts.map