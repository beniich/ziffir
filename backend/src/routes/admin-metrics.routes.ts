import { Router } from 'express';
import * as ctrl from '../domains/analytics/admin-metrics.controller.js';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';

const router = Router();

// Protégé SUPER_ADMIN ou ADMIN
router.use(requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'));

router.get('/overview',    ctrl.getOverview);
router.get('/timeseries',  ctrl.getTimeseries);
router.get('/funnel',      ctrl.getFunnel);
router.get('/cohorts',     ctrl.getCohorts);
router.get('/export',      ctrl.exportCsv);

export default router;
