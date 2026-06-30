// src/server/routes/push.routes.ts
// ============================================================================
// Gestion des subscriptions Push PWA (enregistrement / désinscription)
// ============================================================================

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/push/subscribe
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const actorId = (req as any).auth?.uid || (req as any).auth?.sub;
    if (!actorId) {
      return res.status(401).json({ success: false, error: { message: 'Non authentifié' } });
    }

    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ success: false, error: { message: 'Subscription invalide' } });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: actorId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: req.headers['user-agent'] || null,
      },
      update: {
        userId: actorId,
        p256dh: keys.p256dh,
        auth: keys.auth,
        lastUsedAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// DELETE /api/push/unsubscribe
router.delete('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ success: false, error: { message: '`endpoint` requis' } });
    }
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// GET /api/push/vapid-public-key — renvoie la clé publique VAPID au frontend
router.get('/vapid-public-key', (_req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.json({ success: false, error: { message: 'Push non configuré' } });
  }
  res.json({ success: true, data: { vapidPublicKey: key } });
});

export default router;
