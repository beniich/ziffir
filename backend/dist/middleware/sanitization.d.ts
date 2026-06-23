import { Request, Response, NextFunction } from 'express';
/**
 * Middleware de sanitization des inputs (XSS Protection).
 * Nettoie le body, query et params de toute balise script ou HTML malveillant.
 */
export declare const sanitizeInputs: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=sanitization.d.ts.map