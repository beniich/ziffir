import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { authLimiter } from '../config/rateLimit';

const router = Router();

router.post('/register', authLimiter, validate(schemas.register), AuthController.register);
router.post('/login',    authLimiter, validate(schemas.login),    AuthController.login);
router.post('/refresh',  authLimiter, validate(schemas.refresh),  AuthController.refresh);
router.post('/logout',   requireAuth, AuthController.logout);
router.get('/me',        requireAuth, AuthController.me);

export default router;

