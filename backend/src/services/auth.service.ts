import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { authLockouts } from '../utils/metrics';

const prisma = new PrismaClient();

// 🔐 Secrets JWT — FATAL si absents en production
const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_ACCESS_SECRET et JWT_REFRESH_SECRET sont requis en production');
  }
}

const ACCESS_SECRET_SAFE  = ACCESS_SECRET  || 'dev-access-CHANGE-IN-PROD';
const REFRESH_SECRET_SAFE = REFRESH_SECRET || 'dev-refresh-CHANGE-IN-PROD';
const ACCESS_EXPIRY  = '15m';
const REFRESH_EXPIRY = '7d';
const BCRYPT_ROUNDS  = 12;


export type UserRole = 'VISITOR' | 'CLIENT' | 'HOTEL' | 'SUPER_ADMIN';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: { id: string; email: string; username: string; role: UserRole; hotelId?: string | null };
  tokens: TokenPair;
}

export class AuthService {
  // ════════════════════════════════════════════════════════════
  // HASH & VERIFY
  // ════════════════════════════════════════════════════════════

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // ════════════════════════════════════════════════════════════
  // TOKENS
  // ════════════════════════════════════════════════════════════

  static generateAccessToken(userId: string, role: UserRole, hotelId?: string | null): string {
    return jwt.sign({ userId, role, hotelId, type: 'access' }, ACCESS_SECRET_SAFE, {
      expiresIn: ACCESS_EXPIRY,
    });
  }

  static generateRefreshToken(userId: string): string {
    const jti = crypto.randomUUID();
    return jwt.sign({ userId, jti, type: 'refresh' }, REFRESH_SECRET_SAFE, {
      expiresIn: REFRESH_EXPIRY,
    });
  }

  static verifyAccessToken(token: string): { userId: string; role: UserRole; hotelId?: string | null } {
    try {
      const decoded = jwt.verify(token, ACCESS_SECRET_SAFE) as any;
      if (decoded.type !== 'access') throw new Error('Type de token invalide');
      return { userId: decoded.userId, role: decoded.role, hotelId: decoded.hotelId };
    } catch (err: any) {
      throw new Error(err.message === 'jwt expired' ? 'Token expiré' : 'Token invalide');
    }
  }

  static verifyRefreshToken(token: string): { userId: string; jti: string } {
    try {
      const decoded = jwt.verify(token, REFRESH_SECRET_SAFE) as any;
      if (decoded.type !== 'refresh') throw new Error('Type de token invalide');
      return { userId: decoded.userId, jti: decoded.jti };
    } catch (err: any) {
      throw new Error(err.message === 'jwt expired' ? 'Refresh token expiré' : 'Refresh token invalide');
    }
  }

  // ════════════════════════════════════════════════════════════
  // BUSINESS LOGIC
  // ════════════════════════════════════════════════════════════

  static async register(
    email: string,
    username: string,
    password: string,
    role: UserRole = 'CLIENT',
  ): Promise<AuthResult> {
    // Vérifier doublons
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true, username: true },
    });

    if (existing) {
      if (existing.email === email) throw new Error('Cet email est déjà utilisé');
      throw new Error('Ce nom d\'utilisateur est déjà pris');
    }

    const passwordHash = await this.hashPassword(password);
    const user = await prisma.user.create({
      data: { email, username, passwordHash, role },
    });

    const tokens = {
      accessToken:  this.generateAccessToken(user.id, user.role as UserRole, user.hotelId),
      refreshToken: this.generateRefreshToken(user.id),
    };

    // Stocker le refresh token (pour révocation)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: { id: user.id, email: user.email, username: user.username, role: user.role as UserRole, hotelId: user.hotelId },
      tokens,
    };
  }

  static async login(email: string, password: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email } });

    // Message générique (anti-énumération)
    if (!user || !user.isActive) throw new Error('Identifiants invalides');

    // Vérifier lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Compte bloqué temporairement suite à de nombreuses tentatives.');
    }

    const valid = await this.verifyPassword(password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedAttempts + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: attempts, lockedUntil },
      });
      if (lockedUntil) {
        authLockouts.inc();
      }
      throw new Error('Identifiants invalides');
    }

    const tokens = {
      accessToken:  this.generateAccessToken(user.id, user.role as UserRole),
      refreshToken: this.generateRefreshToken(user.id),
    };

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken, lastLogin: new Date(), failedAttempts: 0, lockedUntil: null },
    });

    return {
      user: { id: user.id, email: user.email, username: user.username, role: user.role as UserRole, hotelId: user.hotelId },
      tokens,
    };
  }

  static async refresh(refreshToken: string): Promise<TokenPair> {
    const { userId } = this.verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Vérifier que le token correspond (révocation)
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      throw new Error('Refresh token révoqué ou invalide');
    }

    const newTokens = {
      accessToken:  this.generateAccessToken(user.id, user.role as UserRole, user.hotelId),
      refreshToken: this.generateRefreshToken(user.id),
    };

    // Rotation : ancien refresh est invalidé
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newTokens.refreshToken },
    });

    return newTokens;
  }

  static async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
