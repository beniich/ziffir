import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user details using high salt-rounds signatures
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Extract profile metadata of signed-in credentials
 */
router.get('/profile', requireAuth, AuthController.getProfile);

export default router;
