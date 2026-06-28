import { Router } from 'express';
import * as ctrl from '../controllers/webhooks.controller.js';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';

const router = Router();

// L'administration des webhooks nécessite d'être au moins MANAGER
router.use(requireAuth, requireRole('ADMIN', 'MANAGER'));

router.get('/', ctrl.listWebhooks);
router.post('/', ctrl.createWebhook);
router.delete('/:id', ctrl.deleteWebhook);
router.get('/:id/logs', ctrl.getWebhookLogs);

export default router;
