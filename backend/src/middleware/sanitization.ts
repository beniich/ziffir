import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Middleware de sanitization des inputs (XSS Protection).
 * Nettoie le body, query et params de toute balise script ou HTML malveillant.
 */
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const sanitizeObj = (obj: any): any => {
      if (typeof obj === 'string') {
        return DOMPurify.sanitize(obj, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
      }
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          return obj.map(item => sanitizeObj(item));
        }
        const newObj: any = {};
        for (const key in obj) {
          // Check for NoSQL injection keys (e.g. $gt, $ne)
          if (key.startsWith('$')) {
            throw new Error(`Invalid key detected: ${key}`);
          }
          newObj[key] = sanitizeObj(obj[key]);
        }
        return newObj;
      }
      return obj;
    };

    if (req.body) req.body = sanitizeObj(req.body);
    if (req.query) req.query = sanitizeObj(req.query);
    if (req.params) req.params = sanitizeObj(req.params);

    next();
  } catch (error) {
    res.status(400).json({ success: false, error: 'Données invalides détectées (Sanitization)' });
  }
};
