import { Request, Response, NextFunction } from 'express';
import { InvitationService } from '../services/invitation.service';
import { AuthV2Service } from '../services/auth-v2.service';
import { HotelContextService } from '../services/hotel-context.service';
import { prisma } from '../server';
import { AppError } from '../middleware/errorHandler';

export class TeamController {
  // ═══ Invitations ═══
  static async listInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const activeHotelId = (req as any).user.activeHotelId;
      if (!activeHotelId) throw new AppError(400, 'Hotel actif manquant');
      const invitations = await InvitationService.listForHotel(activeHotelId);
      res.json(invitations);
    } catch (err) {
      next(err);
    }
  }

  static async createInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const activeHotelId = (req as any).user.activeHotelId;
      if (!activeHotelId) throw new AppError(400, 'Hotel actif manquant');
      const data = { ...req.body, hotelId: activeHotelId, invitedById: (req as any).user.userId };
      const result = await InvitationService.create(data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async acceptInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const result = await InvitationService.accept(token, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async revokeInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await InvitationService.revoke(id, (req as any).user.userId);
      res.json({ message: 'Invitation révoquée' });
    } catch (err) {
      next(err);
    }
  }

  // ═══ Members ═══
  static async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const activeHotelId = (req as any).user.activeHotelId;
      if (!activeHotelId) throw new AppError(400, 'Hotel actif manquant');
      const members = await prisma.membership.findMany({
        where: { hotelId: activeHotelId },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
      });
      res.json(members);
    } catch (err) {
      next(err);
    }
  }

  static async updateMember(req: Request, res: Response, next: NextFunction) {
    try {
      const activeHotelId = (req as any).user.activeHotelId;
      if (!activeHotelId) throw new AppError(400, 'Hotel actif manquant');
      const { id } = req.params;
      
      const member = await prisma.membership.findUnique({ where: { id } });
      if (!member || member.hotelId !== activeHotelId) {
        throw new AppError(404, 'Membre introuvable dans cet hôtel');
      }

      const updated = await prisma.membership.update({
        where: { id },
        data: req.body,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const activeHotelId = (req as any).user.activeHotelId;
      if (!activeHotelId) throw new AppError(400, 'Hotel actif manquant');
      const { id } = req.params;

      const member = await prisma.membership.findUnique({ where: { id } });
      if (!member || member.hotelId !== activeHotelId) {
        throw new AppError(404, 'Membre introuvable dans cet hôtel');
      }

      await prisma.membership.delete({ where: { id } });
      res.json({ message: 'Membre supprimé' });
    } catch (err) {
      next(err);
    }
  }

  // ═══ Sessions ═══
  static async listUserSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await AuthV2Service.listSessions((req as any).user.userId);
      res.json(sessions);
    } catch (err) {
      next(err);
    }
  }

  static async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // Note: Ideally, check if the session belongs to the user
      await AuthV2Service.revokeSession(id, 'user_requested');
      res.json({ message: 'Session révoquée' });
    } catch (err) {
      next(err);
    }
  }

  static async revokeAllSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await AuthV2Service.revokeAllSessions((req as any).user.userId, (req as any).user.sessionId);
      res.json({ message: `Toutes les autres sessions (${count}) ont été révoquées` });
    } catch (err) {
      next(err);
    }
  }

  // ═══ Hotel Switch ═══
  static async listAccessibleHotels(req: Request, res: Response, next: NextFunction) {
    try {
      const hotels = await HotelContextService.listAccessibleHotels((req as any).user.userId);
      res.json(hotels);
    } catch (err) {
      next(err);
    }
  }

  static async switchHotel(req: Request, res: Response, next: NextFunction) {
    try {
      const { hotelId } = req.params;
      const result = await HotelContextService.switchActiveHotel((req as any).user.userId, (req as any).user.sessionId, hotelId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
