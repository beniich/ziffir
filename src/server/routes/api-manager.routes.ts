// src/server/routes/api-manager.routes.ts
// ============================================================================
// API Manager Routes : Suivi et Kill Switch des quotas API
// ============================================================================

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auditService } from '../domains/shared/services/audit.service.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/tokens — Liste tous les quotas
router.get('/', async (req: Request, res: Response) => {
  try {
    const auth = (req as any).auth;
    const hotelId = auth?.hotelId || auth?.tenantId || 'hotel-dev';
    const role = (auth?.role || '').toLowerCase();

    // Seul un admin ou proprietaire peut voir
    if (role !== 'administrateur' && role !== 'owner') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }

    const quotas = await prisma.apiTokenQuota.findMany({
      where: { hotelId },
      orderBy: { consumedToday: 'desc' },
    });

    res.json({ success: true, data: quotas });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// PATCH /api/tokens/:id — Kill switch / modifier limite
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const auth = (req as any).auth;
    const hotelId = auth?.hotelId || auth?.tenantId || 'hotel-dev';
    const actorId = auth?.uid || auth?.sub || 'system';
    
    const { isSuspended, dailyLimit, suspendReason } = req.body;
    
    const quota = await prisma.apiTokenQuota.findUnique({
      where: { id: req.params.id }
    });

    if (!quota || quota.hotelId !== hotelId) {
      return res.status(404).json({ success: false, error: { message: 'Introuvable' } });
    }

    const updated = await prisma.apiTokenQuota.update({
      where: { id: quota.id },
      data: {
        isSuspended: isSuspended !== undefined ? isSuspended : quota.isSuspended,
        dailyLimit: dailyLimit !== undefined ? dailyLimit : quota.dailyLimit,
        suspendReason: suspendReason !== undefined ? suspendReason : quota.suspendReason,
        suspendedAt: isSuspended ? new Date() : null,
      }
    });

    await auditService.append({
      eventType: 'security.quota_update',
      tenantId: hotelId,
      actorId,
      actorType: 'user',
      resourceType: 'ApiTokenQuota',
      resourceId: updated.id,
      action: isSuspended ? 'quota.suspend' : 'quota.update',
      metadata: { actorTarget: updated.actorId, suspended: updated.isSuspended },
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

export default router;
