import type { Request, Response, NextFunction } from 'express';
import { logAudit } from './audit.service.js';

/**
 * Middleware qui log automatiquement toutes les requêtes
 * qui mutent des données (POST, PATCH, PUT, DELETE).
 * 
 * Usage:
 *   router.post('/api/rooms', requireAuth, auditMiddleware('room.create'), ctrl.create);
 */
export function auditMiddleware(action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Log APRÈS la réponse (donc on wrap res.json)
    const originalJson = res.json.bind(res);
    
    res.json = (body: any) => {
      // Log uniquement si succès
      if (res.statusCode < 400 && req.user) {
        logAudit({
          actor: req.user.userId,
          action,
          resource: req.baseUrl?.replace('/api/', '') ?? req.path,
          resourceId: req.params.id,
          metadata: {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            ip: req.ip,
          },
          before: req.method === 'PATCH' || req.method === 'DELETE' ? req.body : undefined,
          after: req.method === 'POST' || req.method === 'PATCH' ? req.body : undefined,
        }, req).catch(err => console.error('Auto-audit failed:', err));
      }
      
      return originalJson(body);
    };
    
    next();
  };
}
