import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();

router.use(requireAuth);

// ═══ Invitations ═══
router.get('/invitations', TeamController.listInvitations);
router.post('/invitations', requirePermission('staff.create'), TeamController.createInvitation);
router.post('/invitations/:token/accept', TeamController.acceptInvitation);
router.delete('/invitations/:id', requirePermission('staff.delete'), TeamController.revokeInvitation);

// ═══ Members ═══
router.get('/members', TeamController.listMembers);
router.patch('/members/:id', requirePermission('staff.update'), TeamController.updateMember);
router.delete('/members/:id', requirePermission('staff.delete'), TeamController.removeMember);

// ═══ Sessions ═══
router.get('/sessions', TeamController.listUserSessions);
router.delete('/sessions/:id', TeamController.revokeSession);
router.delete('/sessions', TeamController.revokeAllSessions);

// ═══ Hotel Switch ═══
router.get('/hotels', TeamController.listAccessibleHotels);
router.post('/hotels/:hotelId/switch', TeamController.switchHotel);

export default router;
