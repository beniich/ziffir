import { Router } from 'express';
import * as ctrl from '../controllers/affiliates.controller.js';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';

const router = Router();

// Publique
router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.get('/track', ctrl.trackClick);

// Protégé Affilié (auth par token custom)
router.get('/dashboard', ctrl.getDashboard);

// Admin
router.get('/admin', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), ctrl.listAffiliates);
router.post('/admin/:id/approve', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), ctrl.approveAffiliate);

export default router;
