import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password, role } = req.body;

      const result = await AuthService.register(email, username, password, role);

      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      const status = err.message.includes('déjà') ? 409 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/auth/refresh
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const tokens = await AuthService.refresh(refreshToken);

      res.json({ success: true, data: tokens });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    if (req.user) {
      await AuthService.logout(req.user.userId);
    }
    res.json({ success: true, message: 'Déconnecté avec succès' });
  }

  /**
   * GET /api/auth/me — retourne l'utilisateur complet depuis la DB
   */
  static async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, email: true, username: true, role: true, hotelId: true, isActive: true, createdAt: true },
      });

      if (!user || !user.isActive) {
        res.status(401).json({ success: false, error: 'Utilisateur introuvable ou désactivé' });
        return;
      }

      res.json({ success: true, data: user });
    } catch {
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
}
