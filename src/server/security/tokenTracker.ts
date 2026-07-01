// src/server/security/tokenTracker.ts
// ============================================================================
// Enveloppe de Sécurité : Token & API Manager
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mémorisation en cache (TTL court) pour éviter d'inonder la DB à chaque appel
const quotaCache = new Map<string, { consumed: number, limit: number, suspended: boolean, expiresAt: number }>();

export const trackTokens = (costPerRequest: number = 1) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Si la route est ignorée (ex: webhooks, static)
    if (!req.path.startsWith('/api') || req.path === '/api/state') {
      return next();
    }

    const auth = (req as any).auth;
    const hotelId = auth?.hotelId || auth?.tenantId || 'hotel-dev';
    const actorId = auth?.uid || auth?.sub || 'anonymous';
    const actorType: string = auth?.role ? 'role' : 'user';

    const cacheKey = `${hotelId}:${actorType}:${actorId}`;
    let quota = quotaCache.get(cacheKey);

    // Si pas en cache ou expiré, fetch DB
    if (!quota || quota.expiresAt < Date.now()) {
      try {
        let dbQuota = await prisma.apiTokenQuota.findUnique({
          where: { hotelId_actorType_actorId: { hotelId, actorType, actorId } }
        });

        if (!dbQuota) {
          // Auto-provision
          dbQuota = await prisma.apiTokenQuota.create({
            data: {
              hotelId,
              actorId,
              actorType,
              dailyLimit: actorType === 'system' ? 100000 : 1000,
            }
          });
        }

        quota = {
          consumed: dbQuota.consumedToday,
          limit: dbQuota.dailyLimit,
          suspended: dbQuota.isSuspended,
          expiresAt: Date.now() + 60_000 // Cache 1 minute
        };
        quotaCache.set(cacheKey, quota);
      } catch (e) {
        console.error('[TokenTracker] Error fetching quota', e);
        return next();
      }
    }

    // Vérification Suspension "Kill Switch"
    if (quota.suspended) {
      console.warn(`[TokenTracker] ACCESS DENIED: Account suspended (${cacheKey})`);
      return res.status(403).json({
        success: false,
        error: { message: 'Account API access suspended', code: 'ACCOUNT_SUSPENDED' }
      });
    }

    // Vérification Quota
    if (quota.consumed + costPerRequest > quota.limit) {
      console.warn(`[TokenTracker] QUOTA EXCEEDED: ${cacheKey}`);
      return res.status(429).json({
        success: false,
        error: { message: 'API Token Quota Exceeded', code: 'QUOTA_EXCEEDED' }
      });
    }

    // Incrémenter en cache et déclencher save asynchrone
    quota.consumed += costPerRequest;
    
    // Background update (fire and forget) pour ne pas ralentir la requête
    prisma.apiTokenQuota.update({
      where: { hotelId_actorType_actorId: { hotelId, actorType, actorId } },
      data: { consumedToday: { increment: costPerRequest } }
    }).catch(e => console.error('[TokenTracker] Failed to persist usage', e));

    res.setHeader('X-Tokens-Used', quota.consumed.toString());
    res.setHeader('X-Tokens-Limit', quota.limit.toString());

    next();
  };
};
