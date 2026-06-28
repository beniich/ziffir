import { Router } from 'express';
import * as ctrl from '../domains/identity/user/leads.controller.js';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';

const router = Router();

// Public : n'importe qui peut créer un lead
router.post('/', ctrl.createLead);

// Admin : voir et gérer les leads
router.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), ctrl.listLeads);
router.get('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), ctrl.getLead);
router.patch('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), ctrl.updateLeadStatus);

export default router;
