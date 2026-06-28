import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, loginMobile, logout, me, register } from '../domains/identity/auth/auth.controller.js';
import { requireAuth } from '../domains/identity/auth/auth.middleware.js';

const router = Router();

// Brute-force protection : 5 tentatives / 15 min / IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessayez dans 15 minutes' },
});

router.post('/login', loginLimiter, login);
router.post('/login-mobile', loginLimiter, loginMobile);
router.post('/register', loginLimiter, register);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
