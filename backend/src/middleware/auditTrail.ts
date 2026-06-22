import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { securePrisma } from '../services/secure-prisma';
import crypto from 'crypto';

/**
 * Middleware d'Audit Trail.
 * Enregistre les actions sensibles (mutations) pour des raisons de conformité et sécurité.
 */
export const auditTrail = (req: Request, res: Response, next: NextFunction): void => {
  // On ne trace que les mutations et authentifications
  const isSensitiveAction = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || req.path.includes('/auth/');
  
  if (!isSensitiveAction) {
    return next();
  }

  const startTime = Date.now();
  const originalSend = res.send;

  // Intercepter la réponse pour logguer le résultat
  res.send = function (body) {
    const duration = Date.now() - startTime;
    const userContext = (req as any).user;
    const userId = userContext?.userId || 'anonymous';
    const role = userContext?.role || 'SYSTEM';
    const hotelId = userContext?.hotelId || null;
    
    // Masquer les données sensibles
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    if (sanitizedBody.token) sanitizedBody.token = '***';

    logger.info('AUDIT_TRAIL', {
      timestamp: new Date().toISOString(),
      userId,
      action: `${req.method} ${req.path}`,
      ip: req.ip,
      status: res.statusCode,
      durationMs: duration,
      payload: process.env.NODE_ENV !== 'production' ? sanitizedBody : 'Redacted for production',
      userAgent: req.get('user-agent')
    });

    if (res.statusCode < 400 && userContext && userContext.role === 'HOTEL') {
      // Async DB persist without blocking the response
      setImmediate(async () => {
        try {
          const action = `${req.method} ${req.path}`;
          const lastAudit: any = await securePrisma.audit.findFirst(userContext, {
            orderBy: { timestamp: 'desc' },
          }).catch(() => null);

          const previousHash = lastAudit?.hash ?? '0'.repeat(64);
          const logId = `AUTO-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          const reason = 'AUTO_TRAIL';

          const hashInput = `${logId}|${previousHash}|${action}|${userId}|${reason}`;
          const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

          await securePrisma.audit.create(userContext, {
            data: {
              logId,
              userId,
              userName: role,
              hotelId,
              action,
              reason,
              previousHash,
              hash,
              status: 'AUTHORIZED',
              timestamp: new Date(),
            }
          });
        } catch (err) {
          logger.error('Failed to save audit trail to DB', err);
        }
      });
    }

    return originalSend.call(this, body);
  };

  next();
};
