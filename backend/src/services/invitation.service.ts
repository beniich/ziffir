import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { sendEmail } from './email.service';
import type { HotelRole } from '@prisma/client';

export class InvitationService {
  static async create(data: {
    email: string;
    hotelId: string;
    proposedRole: HotelRole;
    department?: string;
    position?: string;
    personalMessage?: string;
    invitedById: string;
  }): Promise<{ token: string; invitation: any }> {
    const hotel = await prisma.hotel.findUnique({
      where: { id: data.hotelId },
      select: { id: true, name: true, slug: true },
    });
    if (!hotel) throw new AppError(404, 'Hôtel introuvable');

    const inviterMembership = await prisma.membership.findUnique({
      where: {
        userId_hotelId: { userId: data.invitedById, hotelId: data.hotelId },
      },
    });

    if (!inviterMembership || !['OWNER', 'ADMIN'].includes(inviterMembership.hotelRole)) {
      throw new AppError(403, 'Vous n\'avez pas le droit d\'inviter');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        memberships: { where: { hotelId: data.hotelId } },
      },
    });

    if (existingUser?.memberships.length) {
      throw new AppError(409, 'Cet utilisateur est déjà membre de cet hôtel');
    }

    const existingInvite = await prisma.invitation.findFirst({
      where: {
        email: data.email,
        hotelId: data.hotelId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw new AppError(409, 'Une invitation est déjà en attente pour cet email');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        email: data.email,
        hotelId: data.hotelId,
        proposedRole: data.proposedRole,
        department: data.department,
        position: data.position,
        personalMessage: data.personalMessage,
        token,
        expiresAt,
        invitedById: data.invitedById,
      },
    });

    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`;
    await sendEmail({
      to: data.email,
      subject: `Invitation à rejoindre ${hotel.name} sur Zaphir`,
      template: 'invitation',
      data: {
        hotelName: hotel.name,
        inviterName: (await prisma.user.findUnique({ where: { id: data.invitedById } }))?.firstName || 'Un membre',
        personalMessage: data.personalMessage,
        proposedRole: data.proposedRole,
        inviteUrl,
        expiresAt: expiresAt.toLocaleDateString('fr-FR'),
      },
    });

    logger.info({ invitationId: invitation.id, email: data.email }, 'Invitation sent');
    return { token, invitation };
  }

  static async accept(token: string, userData?: {
    password?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ user: any; tokens: any; hotelId: string }> {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { hotel: true, invitedBy: true },
    });

    if (!invitation) throw new AppError(404, 'Invitation introuvable');
    if (invitation.status !== 'PENDING') throw new AppError(400, 'Cette invitation n\'est plus valide');
    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new AppError(400, 'Cette invitation a expiré');
    }

    let user = await prisma.user.findUnique({ where: { email: invitation.email } });

    if (!user) {
      if (!userData?.password) {
        throw new AppError(400, 'Mot de passe requis pour créer le compte');
      }

      const passwordHash = await bcrypt.hash(userData.password, 12);
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          username: invitation.email.split('@')[0],
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'STAFF',
          emailVerified: true,
        },
      });
    }

    await prisma.membership.create({
      data: {
        userId: user.id,
        hotelId: invitation.hotelId,
        hotelRole: invitation.proposedRole,
        department: invitation.department,
        position: invitation.position,
        joinedAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });

    const { AuthV2Service } = await import('./auth-v2.service');
    const session = await AuthV2Service.createSession(user.id, {});

    const tokens = {
      accessToken: AuthV2Service.generateAccessToken({
        userId: user.id,
        email: user.email,
        globalRole: user.role,
        activeHotelId: invitation.hotelId,
        sessionId: session.id,
      }),
      refreshToken: AuthV2Service.generateRefreshToken(user.id, session.id),
      expiresIn: 900,
    };

    logger.info({ userId: user.id, hotelId: invitation.hotelId }, 'Invitation accepted');

    return { user, tokens, hotelId: invitation.hotelId };
  }

  static async revoke(invitationId: string, revokedById: string): Promise<void> {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'REVOKED' },
    });
  }

  static async listForHotel(hotelId: string) {
    return prisma.invitation.findMany({
      where: { hotelId },
      include: {
        invitedBy: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
