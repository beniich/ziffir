import { Request, Response, NextFunction } from 'express';
/**
 * Middleware CSRF simplifié pour les API pures.
 * Vérifie que la requête ne vient pas d'un simple <form> non autorisé.
 */
export declare const csrfProtection: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=csrf.d.ts.map