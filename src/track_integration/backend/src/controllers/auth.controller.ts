import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuthService } from '../services/auth.service';
import { FirebaseAdminService } from '../services/firebase-admin.service';
import type { UserRole } from '../../../../../types';

// ── Role mapping depuis Firebase (Custom Claims ou email domain) ──────────────
function resolveRoleFromFirebase(email: string, customClaims?: Record<string, any>): UserRole {
  if (customClaims?.role) return customClaims.role as UserRole;
  // Logique de fallback par domaine email
  if (email.endsWith('@zaphir-admin.com')) return 'SUPER_ADMIN';
  if (email.endsWith('@hotel.zaphir.com')) return 'HOTEL';
  return 'CLIENT';
}

export class AuthController {

  // ── POST /auth/login — Email / Password ───────────────────────────────────
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    try {
      const result = await AuthService.loginWithPassword(email, password);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }
  }

  // ── POST /auth/firebase-verify — Google OAuth via Firebase ────────────────
  static async firebaseVerify(req: Request, res: Response) {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken Firebase manquant.' });
    }

    try {
      // Vérifier le token Firebase côté serveur avec firebase-admin (sécurisé)
      const decoded = await FirebaseAdminService.verifyIdToken(idToken);
      const role = resolveRoleFromFirebase(decoded.email || '', decoded);

      const result = await AuthService.createOrUpdateFirebaseUser({
        uid: decoded.uid,
        email: decoded.email || '',
        displayName: decoded.name || decoded.email || 'Utilisateur',
        role,
      });

      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(401).json({ error: `Vérification Firebase échouée : ${err.message}` });
    }
  }

  // ── POST /auth/register ────────────────────────────────────────────────────
  static async register(req: Request, res: Response) {
    const { email, username, password, role } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username et mot de passe requis.' });
    }

    try {
      const result = await AuthService.register({ email, username, password, role: role || 'CLIENT' });
      return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ── POST /auth/logout ─────────────────────────────────────────────────────
  static async logout(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.userId) {
        await AuthService.revokeRefreshToken(req.user.userId);
      }
      return res.json({ success: true, message: 'Session terminée.' });
    } catch {
      return res.json({ success: true });
    }
  }

  // ── POST /auth/refresh ────────────────────────────────────────────────────
  static async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token manquant.' });
    }

    try {
      const result = await AuthService.refreshTokens(refreshToken);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(401).json({ error: 'Refresh token invalide ou expiré.' });
    }
  }

  // ── GET /auth/me — Profil utilisateur connecté ────────────────────────────
  static getProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié.' });
    }
    return res.json({ success: true, data: req.user });
  }
}
