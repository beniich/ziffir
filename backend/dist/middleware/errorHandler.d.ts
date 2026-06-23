import { Request, Response, NextFunction } from 'express';
/**
 * Erreur applicative typée (avec status HTTP).
 */
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    isOperational: boolean;
    constructor(statusCode: number, message: string, isOperational?: boolean);
}
/**
 * 404 handler — à placer APRÈS toutes les routes.
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
/**
 * Error handler global — à placer en DERNIER dans app.ts.
 */
export declare const errorHandler: (err: Error, req: Request, res: Response, _next: NextFunction) => void;
/**
 * Wrapper pour les controllers async (évite try/catch répétés).
 */
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map