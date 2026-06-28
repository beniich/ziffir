import { Router } from 'express';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';
import {
  listChannels,
  getChannel,
  createChannel,
  pauseChannel,
  resumeChannel,
  deleteChannel,
  pushNow,
  pullNow,
  fullSync,
  getSyncLogs,
  getAvailableChannelTypes,
} from '../controllers/channels.controller.js';

const router = Router();

router.use(requireAuth);

// Lire les canaux — tous les rôles managériaux
router.get('/', requireRole('MANAGER', 'ADMIN', 'SUPER_ADMIN'), listChannels);
router.get('/types', requireRole('MANAGER', 'ADMIN', 'SUPER_ADMIN'), getAvailableChannelTypes);
router.get('/logs', requireRole('MANAGER', 'ADMIN', 'SUPER_ADMIN'), getSyncLogs);
router.get('/:id', requireRole('MANAGER', 'ADMIN', 'SUPER_ADMIN'), getChannel);

// Mutations — admin only
router.post('/', requireRole('ADMIN', 'SUPER_ADMIN'), createChannel);
router.post('/:id/pause', requireRole('ADMIN', 'SUPER_ADMIN'), pauseChannel);
router.post('/:id/resume', requireRole('ADMIN', 'SUPER_ADMIN'), resumeChannel);
router.delete('/:id', requireRole('ADMIN', 'SUPER_ADMIN'), deleteChannel);

// Sync actions — manager+
router.post('/sync/push', requireRole('MANAGER', 'ADMIN', 'SUPER_ADMIN'), pushNow);
router.post('/sync/pull', requireRole('MANAGER', 'ADMIN', 'SUPER_ADMIN'), pullNow);
router.post('/sync/full', requireRole('MANAGER', 'ADMIN', 'SUPER_ADMIN'), fullSync);

export default router;
