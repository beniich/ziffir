import { Request, Response, NextFunction } from 'express';
import { auditService } from '../domains/shared/services/audit.service';

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only audit mutations
  if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) {
    return next();
  }

  // Intercept the response finish event to ensure we log successful/failed actions
  res.on('finish', () => {
    // Determine the actor
    const actorId = (req as any).user?.id || undefined;
    const actorType = (req as any).user?.role === 'ADMIN' ? 'super_admin' : 'user';
    const tenantId = (req as any).activeHotel?.id || undefined;

    // Sanitize body (remove passwords, tokens, etc.)
    const sanitizedBody = { ...req.body };
    const sensitiveKeys = ['password', 'token', 'secret', 'creditCard', 'totpCode'];
    for (const key of Object.keys(sanitizedBody)) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        sanitizedBody[key] = '[REDACTED FOR SOC2 COMPLIANCE]';
      }
    }

    // Identify resource from URL (e.g. /api/users/123 -> Resource: users, ID: 123)
    const urlParts = req.originalUrl.split('?')[0].split('/').filter(Boolean);
    let resourceType = urlParts.length > 1 ? urlParts[1] : 'system';
    let resourceId = urlParts.length > 2 ? urlParts[2] : undefined;

    // Skip certain high-volume non-sensitive routes if necessary
    // e.g., if (resourceType === 'metrics') return;

    auditService.append({
      eventType: `HTTP.${req.method}`,
      tenantId,
      actorId,
      actorType,
      resourceType,
      resourceId,
      action: `${req.method} ${req.originalUrl}`,
      ipAddress: req.ip,
      userAgent: (req.headers['user-agent'] as string) || undefined,
      metadata: {
        statusCode: res.statusCode,
        body: sanitizedBody,
        query: req.query
      }
    }).catch(err => {
      // Don't crash the request if audit fails, but log it critically
      console.error('[CRITICAL] Audit log failed to write:', err);
    });
  });

  next();
};
