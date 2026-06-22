import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenantIsolation';
import { register } from '../utils/metrics';
import { checkRedisHealth } from '../config/redis';

// All imported routes
import authRoutes from './auth.routes';
import roomOrderRoutes from './room-order.routes';
import staffRoutes from './staff.routes';
import vaultRoutes from './vault.routes';
import controlsRoutes from './controls.routes';
import pricingRoutes from './pricing.routes';
import analyticsRoutes from './analytics.routes';
import auditRoutes from './audit.routes';
import hotelRoutes from './hotel.routes';
import userRoutes from './user.routes';
import invoiceRoutes from './invoice.routes';
import notificationRoutes from './notification.routes';
import aiRoutes from './ai.routes';
import mlRoutes from './ml.routes';

const router = Router();

// ════════════════════════════════════════════════════════════
// 1. ROUTES 100% PUBLIQUES (whitelist explicite)
// ════════════════════════════════════════════════════════════

router.use('/auth', authRoutes);

router.get('/health', async (_req, res) => {
  const redisHealthy = await checkRedisHealth();
  res.json({
    success: true,
    data: {
      status: redisHealthy ? 'operational' : 'degraded',
      uptime: process.uptime(),
      redis: redisHealthy ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    },
  });
});

router.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ════════════════════════════════════════════════════════════
// 2. MIDDLEWARES GLOBAUX (à partir d'ici : tout est protégé)
// ════════════════════════════════════════════════════════════

router.use(requireAuth);       // 1. Vérifie JWT → req.user
router.use(tenantIsolation);  // 2. Injecte hotelId/userId

// ════════════════════════════════════════════════════════════
// 3. ROUTES MÉTIER (toutes protégées par défaut)
// ════════════════════════════════════════════════════════════

router.use('/room-orders', roomOrderRoutes);
router.use('/staff', staffRoutes);
router.use('/vault', vaultRoutes);
router.use('/controls', controlsRoutes);
router.use('/pricing', pricingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audits', auditRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/ml', mlRoutes);

// ─── Réservé SUPER_ADMIN ────────────────────────────────
router.use('/hotels', hotelRoutes);
router.use('/users', userRoutes);

export default router;
