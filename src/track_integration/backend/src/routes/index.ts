import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenantIsolation';
import { register, checkRedisHealth } from '../config/redis';
import { logger } from '../utils/logger';

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

const router = Router();

// ==========================================
// 1. PUBLIC ROUTES (Skip Auth & Isolation)
// ==========================================

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

// ==========================================
// 2. GLOBAL SEGREGATION MIDDLEWARES
// ==========================================

logger.info('🔒 Enforcing Global Multi-tenant Security Context Layers');

router.use(requireAuth);       // Layer 1: Validate session JWT credentials
router.use(tenantIsolation as any);  // Layer 2: Lock client queries to tenant silo context

// ==========================================
// 3. SECURED BUSINESS/OPERATIONAL ENDPOINTS
// ==========================================

router.use('/room-orders', roomOrderRoutes);
router.use('/staff', staffRoutes);
router.use('/vault', vaultRoutes);
router.use('/controls', controlsRoutes);
router.use('/pricing', pricingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audits', auditRoutes);

// High elevation routes
router.use('/hotels', hotelRoutes);
router.use('/users', userRoutes);

export default router;
