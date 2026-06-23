import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/auth/login
 * Connexion email/password — retourne JWT métier avec rôle RBAC
 */
router.post('/login', AuthController.login);

/**
 * @route POST /api/auth/firebase-verify
 * Échange un idToken Firebase contre un JWT métier signé avec rôle RBAC.
 * Utilisé après connexion Google via Firebase Auth côté frontend.
 */
router.post('/firebase-verify', AuthController.firebaseVerify);

/**
 * @route POST /api/auth/register
 * Inscription nouvel utilisateur
 */
router.post('/register', AuthController.register);

/**
 * @route POST /api/auth/logout
 * Invalidation de session
 */
router.post('/logout', requireAuth, AuthController.logout);

/**
 * @route POST /api/auth/refresh
 * Renouvellement du token d'accès via refresh token
 */
router.post('/refresh', AuthController.refresh);

/**
 * @route GET /api/auth/me
 * Profil de l'utilisateur connecté
 */
router.get('/me', requireAuth, AuthController.getProfile);

/**
 * @route GET /api/auth/profile
 * Alias de /me (rétrocompatibilité)
 */
router.get('/profile', requireAuth, AuthController.getProfile);

export default router;
