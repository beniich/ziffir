import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../server';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'zaphir-access-secret-fallback-64-chars-long-string';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'zaphir-refresh-secret-fallback-64-chars-long-string';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
  globalRole: string;
  activeHotelId?: string | null;
  sessionId: string;
}

export class AuthV2Service {
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, {
      expiresIn: '15m',
      jwtid: crypto.randomUUID(),
    });
  }

  static generateRefreshToken(userId: string, sessionId: string): string {
    return jwt.sign(
      { userId, sessionId, type: 'refresh' },
      REFRESH_SECRET,
      { expiresIn: '7d', jwtid: crypto.randomUUID() }
    );
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
  }

  static async login(
    email: string,
    password: string,
    metadata: { userAgent?: string; ipAddress?: string } = {}
  ): Promise<{
    user: any;
    tokens: TokenPair;
    memberships: Array<{ hotelId: string; hotelName: string; hotelRole: string; hotelSlug: string }>;
  }> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: { hotel: { select: { id: true, name: true, slug: true, isActive: true } } },
          where: { isActive: true },
        },
      },
    });

    if (!user || !user.passwordHash) {
      await bcrypt.compare(password, '$2b$12$' + 'a'.repeat(53));
      throw new AppError(401, 'Identifiants invalides');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Compte désactivé. Contactez le support.');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(403, `Compte temporairement verrouillé jusqu'à ${user.lockedUntil.toISOString()}`);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await this.recordFailedLogin(user.id);
      throw new AppError(401, 'Identifiants invalides');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const session = await this.createSession(user.id, metadata);
    const firstHotel = user.memberships[0];
    const activeHotelId = firstHotel?.hotelId || null;

    const tokens = {
      accessToken: this.generateAccessToken({
        userId: user.id,
        email: user.email,
        globalRole: user.role,
        activeHotelId,
        sessionId: session.id,
      }),
      refreshToken: this.generateRefreshToken(user.id, session.id),
      expiresIn: 900,
    };

    await prisma.userSession.update({
      where: { id: session.id },
      data: { refreshTokenHash: this.hashToken(tokens.refreshToken) },
    });

    await this.logActivity({
      userId: user.id,
      hotelId: activeHotelId,
      action: 'auth.login',
      metadata: { ipAddress: metadata.ipAddress },
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
      memberships: user.memberships.map((m) => ({
        hotelId: m.hotelId,
        hotelName: m.hotel.name,
        hotelSlug: m.hotel.slug,
        hotelRole: m.hotelRole,
      })),
    };
  }

  static async createSession(
    userId: string,
    metadata: { userAgent?: string; ipAddress?: string }
  ): Promise<{ id: string }> {
    return prisma.userSession.create({
      data: {
        userId,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        deviceName: this.parseDevice(metadata.userAgent),
        location: metadata.ipAddress ? await this.geoLocate(metadata.ipAddress) : null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      select: { id: true },
    });
  }

  static async revokeSession(sessionId: string, reason: string): Promise<void> {
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false, revokedAt: new Date(), revokedReason: reason },
    });
  }

  static async revokeAllSessions(userId: string, exceptSessionId?: string): Promise<number> {
    const result = await prisma.userSession.updateMany({
      where: {
        userId,
        isActive: true,
        ...(exceptSessionId && { NOT: { id: exceptSessionId } }),
      },
      data: { isActive: false, revokedAt: new Date(), revokedReason: 'logout_all' },
    });
    return result.count;
  }

  static async listSessions(userId: string) {
    return prisma.userSession.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        deviceName: true,
        location: true,
        ipAddress: true,
        lastUsedAt: true,
        activeHotelId: true,
        createdAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  static async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
      throw new AppError(401, 'Refresh token invalide ou expiré');
    }

    const session = await prisma.userSession.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      throw new AppError(401, 'Session révoquée ou expirée');
    }

    if (session.refreshTokenHash !== this.hashToken(refreshToken)) {
      await this.revokeAllSessions(session.userId, 'token_reuse_detected');
      throw new AppError(401, 'Token reuse détecté. Toutes les sessions ont été révoquées.');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { memberships: { take: 1, where: { isActive: true } } },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Utilisateur désactivé');
    }

    const activeHotelId = session.activeHotelId || user.memberships[0]?.hotelId;

    const newTokens = {
      accessToken: this.generateAccessToken({
        userId: user.id,
        email: user.email,
        globalRole: user.role,
        activeHotelId,
        sessionId: session.id,
      }),
      refreshToken: this.generateRefreshToken(user.id, session.id),
      expiresIn: 900,
    };

    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: this.hashToken(newTokens.refreshToken),
        lastUsedAt: new Date(),
      },
    });

    return newTokens;
  }

  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private static sanitizeUser(user: any) {
    const { passwordHash, failedAttempts, lockedUntil, refreshToken, ...safe } = user;
    return safe;
  }

  private static parseDevice(userAgent?: string): string | null {
    if (!userAgent) return null;
    if (/iPhone/.test(userAgent)) return 'iPhone';
    if (/Android/.test(userAgent)) return 'Android';
    if (/Chrome/.test(userAgent)) return 'Chrome';
    if (/Firefox/.test(userAgent)) return 'Firefox';
    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari';
    return 'Unknown';
  }

  private static async geoLocate(ip: string): Promise<string | null> {
    return null;
  }

  private static async recordFailedLogin(userId: string): Promise<void> {
    const MAX_ATTEMPTS = 5;
    const LOCK_DURATION_MS = 15 * 60 * 1000;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { failedAttempts: true } });
    if (!user) return;

    const attempts = user.failedAttempts + 1;
    const shouldLock = attempts >= MAX_ATTEMPTS;

    await prisma.user.update({
      where: { id: userId },
      data: {
        failedAttempts: attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
      },
    });
  }

  private static async logActivity(data: {
    userId: string;
    hotelId?: string | null;
    action: string;
    metadata?: any;
  }): Promise<void> {
    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        hotelId: data.hotelId,
        action: data.action,
        metadata: data.metadata,
      },
    });
  }
}
