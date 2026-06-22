import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { requireRole } from '../middleware/auth';

const router = Router();

// Enregistrement d'un device (tout utilisateur connecté)
router.post('/register', NotificationController.registerToken);

// Envoi manuel de notification (réservé aux admins)
router.post('/send', requireRole('SUPER_ADMIN'), NotificationController.send);

export default router;
