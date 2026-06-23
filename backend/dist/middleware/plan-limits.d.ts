import { Request, Response, NextFunction } from 'express';
/**
 * Middleware : bloque l'opération si la limite du plan est atteinte.
 * Usage : router.post('/rooms', requirePlanLimit('rooms'), controller.create)
 */
export declare const requirePlanLimit: (metric: "rooms" | "staff" | "apiCalls" | "storage") => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Track automatiquement l'usage après une réponse réussie
 */
export declare const trackApiUsage: () => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=plan-limits.d.ts.map