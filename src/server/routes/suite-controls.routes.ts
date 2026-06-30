// src/server/routes/suite-controls.routes.ts
// ============================================================================
// Suite Controls API - lecture/écriture avec Prisma + broadcast Socket.IO
// Optimistic locking via `version` + audit hash chain
// ============================================================================

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auditService } from '../domains/shared/services/audit.service.js';
import { getRealtimeServer } from '../realtime/socketServer.js';
import { eventBus } from '../core/eventBus.js';

const router = Router();
const prisma = new PrismaClient();

// Presets de scènes
const SCENE_PRESETS: Record<string, Partial<SuiteUpdate>> = {
  IDLE:    { temperatureC: 20, lightLevel: 30, curtainsOpen: false, musicPlaying: false },
  WELCOME: { temperatureC: 22, lightLevel: 70, curtainsOpen: true,  musicPlaying: true  },
  MORNING: { temperatureC: 21, lightLevel: 100,curtainsOpen: true,  musicPlaying: false },
  WORK:    { temperatureC: 21, lightLevel: 90, curtainsOpen: true,  musicPlaying: false },
  DINNER:  { temperatureC: 22, lightLevel: 40, curtainsOpen: false, musicPlaying: true  },
  NIGHT:   { temperatureC: 19, lightLevel: 0,  curtainsOpen: false, musicPlaying: false },
  AWAY:    { temperatureC: 15, lightLevel: 0,  curtainsOpen: false, musicPlaying: false },
};

interface SuiteUpdate {
  temperatureC?: number;
  lightLevel?: number;
  curtainsOpen?: boolean;
  musicPlaying?: boolean;
  musicTrackId?: string | null;
  scene?: string;
  doNotDisturb?: boolean;
  maintenanceMode?: boolean;
  isOccupied?: boolean;
}

// Extraire le tenantId depuis le token (Firebase JWT ou sandbox)
function getTenantId(req: Request): string {
  const auth = (req as any).auth;
  return auth?.hotelId || auth?.tenantId || 'hotel-dev';
}

function getActorId(req: Request): string {
  const auth = (req as any).auth;
  return auth?.uid || auth?.sub || auth?.userId || 'system';
}

// ----------------------------------------------------------------------------
// GET /api/suite-controls — liste toutes les suites de l'hôtel
// ----------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const hotelId = getTenantId(req);

    const states = await prisma.suiteState.findMany({
      where: { hotelId },
      include: {
        room: {
          select: { id: true, number: true, floor: true, type: true },
        },
      },
      orderBy: { room: { number: 'asc' } },
    });

    res.json({ success: true, data: states });
  } catch (e) {
    console.error('[suite-controls] GET / error', e);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ----------------------------------------------------------------------------
// GET /api/suite-controls/:roomId — état d'une suite
// ----------------------------------------------------------------------------
router.get('/:roomId', async (req: Request, res: Response) => {
  try {
    const hotelId = getTenantId(req);

    const state = await prisma.suiteState.findFirst({
      where: { hotelId, roomId: req.params.roomId },
      include: { room: true },
    });

    if (!state) {
      return res.status(404).json({
        success: false,
        error: { message: 'Suite introuvable' },
      });
    }

    res.json({ success: true, data: state });
  } catch (e) {
    console.error('[suite-controls] GET /:roomId error', e);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ----------------------------------------------------------------------------
// PATCH /api/suite-controls/:roomId — mise à jour avec locking optimiste
// ----------------------------------------------------------------------------
router.patch('/:roomId', async (req: Request, res: Response) => {
  try {
    const hotelId = getTenantId(req);
    const actorId = getActorId(req);
    const { version, scene, ...updates }: { version: number; scene?: string } & SuiteUpdate = req.body;

    // Validation basique
    if (typeof version !== 'number') {
      return res.status(400).json({
        success: false,
        error: { message: '`version` est requis' },
      });
    }

    // 1. Lire l'état courant
    const current = await prisma.suiteState.findFirst({
      where: { hotelId, roomId: req.params.roomId },
      include: { room: { select: { number: true } } },
    });

    if (!current) {
      return res.status(404).json({
        success: false,
        error: { message: 'Suite introuvable' },
      });
    }

    // 2. Vérifier le version lock (optimistic concurrency)
    if (current.version !== version) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Conflit : la suite a été modifiée simultanément',
          code: 'VERSION_CONFLICT',
          currentVersion: current.version,
          currentState: current,
        },
      });
    }

    // 3. Appliquer le preset de scène si fourni
    let dataToUpdate: SuiteUpdate = { ...updates };
    if (scene) {
      const preset = SCENE_PRESETS[scene] || {};
      dataToUpdate = { ...preset, ...dataToUpdate, scene };
    }

    const updatedState = await prisma.$transaction(async (tx) => {
      // 1. Mise à jour de l'état (verrou optimiste inclus)
      const u = await tx.suiteState.update({
        where: { id: current.id },
        data: {
          ...dataToUpdate,
          version: { increment: 1 },
          lastUpdatedById: actorId,
        },
        include: { room: true },
      });

      // 2. Journalisation d'audit en chaîne
      await auditService.append(
        {
          eventType: 'suite.update',
          tenantId: hotelId,
          actorId,
          actorType: 'user',
          resourceType: 'SuiteState',
          resourceId: u.id,
          action: 'suite.update',
          metadata: { updates: Object.keys(dataToUpdate), version: u.version },
          ipAddress: req.ip || null,
          userAgent: req.headers['user-agent'] || null,
        },
        tx
      );

      return u;
    });

    // Émettre sur les WebSockets (pour la Vue)
    try {
      const realtime = getRealtimeServer();
      realtime.emitToHotel(hotelId, 'suite:updated', {
        roomId: req.params.roomId,
        state: updatedState,
        updatedBy: actorId,
      });
    } catch (e) {
      console.warn('Realtime server not available', e);
    }

    // Zaphir Core AI Orchestrator events
    if ('isOccupied' in dataToUpdate) {
      eventBus.publish('suite:occupancy_changed', {
        hotelId,
        roomId: req.params.roomId,
        isOccupied: dataToUpdate.isOccupied
      });
    }
    if ('scene' in dataToUpdate) {
      eventBus.publish('suite:scene_changed', {
        hotelId,
        roomId: req.params.roomId,
        scene: dataToUpdate.scene
      });
    }

    res.json({ success: true, data: updatedState });
  } catch (e) {
    console.error('[suite-controls] PATCH error', e);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ----------------------------------------------------------------------------
// GET /api/suite-controls/:roomId/history — historique des changements
// ----------------------------------------------------------------------------
router.get('/:roomId/history', async (req: Request, res: Response) => {
  try {
    const hotelId = getTenantId(req);

    const events = await prisma.suiteControlEvent.findMany({
      where: {
        hotelId,
        suiteState: { roomId: req.params.roomId },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: events });
  } catch (e) {
    console.error('[suite-controls] GET history error', e);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ----------------------------------------------------------------------------
// GET /api/suite-controls/audit/verify — vérification de la hash chain
// (Admin seulement en production)
// ----------------------------------------------------------------------------
router.get('/audit/verify', async (_req: Request, res: Response) => {
  try {
    const result = await auditService.verifyChain();
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: 'Erreur vérification' } });
  }
});

export default router;
