import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { authenticator } = require('otplib');
import { UserRole, HotelRole, Plan, SubscriptionStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { emailService } from '../../lib/email';

const ACCESS_TTL = '15m';
// const REFRESH_TTL = '7d';
const TRIAL_DURATION_DAYS = 14;
const MAX_FAILED_LOGINS = 5;
const LOCK_DURATION_MINUTES = 15;

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// =============================================================================
// MATRICE DE PERMISSIONS PAR RÔLE
// =============================================================================
const ROLE_PERMISSIONS: Record<HotelRole, string[]> = {
  OWNER: ['*'],
  MANAGER: [
    'arrivals.*', 'orders.*', 'suites.*',
    'wines.*', 'tasks.*', 'members.invite', 'members.remove',
    'audit.read', 'billing.view', 'billing.manage',
  ],
  SOMMELIER: ['wines.*', 'orders.read', 'arrivals.read'],
  CONCIERGE: ['arrivals.*', 'guests.*', 'orders.create', 'orders.read', 'suites.read'],
  RECEPTION: ['arrivals.read', 'arrivals.update', 'orders.create', 'orders.read', 'guests.*', 'suites.read'],
  HOUSEKEEPING: ['suites.update', 'suites.read', 'tasks.*'],
  KITCHEN: ['orders.read', 'orders.update', 'tasks.*'],
  STAFF: ['orders.create', 'orders.read', 'suites.read', 'arrivals.read'],
  VIEWER: ['*.read'],
};

// =============================================================================
// TYPES
// =============================================================================
export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  activeHotelId: string | null;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
  };
  activeHotel: {
    id: string;
    name: string;
    slug: string;
    plan: Plan;
    subscriptionStatus: SubscriptionStatus;
    role: HotelRole;
    permissions: string[];
    trialEndsAt: string | null;
    trialDaysLeft: number | null;
  } | null;
  availableHotels: Array<{
    id: string;
    name: string;
    role: HotelRole;
  }>;
}

// =============================================================================
// SERVICE
// =============================================================================
class AuthService {
  
  // ===========================================================================
  // INSCRIPTION
  // ===========================================================================
  async register(input: {
    email: string;
    password: string;
    displayName: string;
    hotelName: string;
    phone?: string;
  }): Promise<{ auth: AuthResult; accessToken: string; refreshToken: string }> {
    if (input.password.length < 12) {
      throw new Error('Le mot de passe doit faire au moins 12 caractères');
    }
    
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new Error('Cet email est déjà utilisé');
    }
    
    const passwordHash = await bcrypt.hash(input.password, 12);
    const slug = await this.generateUniqueSlug(input.hotelName);
    
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          displayName: input.displayName,
          phone: input.phone,
          role: 'CLIENT',
        },
      });
      
      const trialEndsAt = new Date(Date.now() + TRIAL_DURATION_DAYS * 86400000);
      const hotel = await tx.hotel.create({
        data: {
          name: input.hotelName,
          slug,
          ownerId: user.id,
          plan: 'FREE_TRIAL',
          trialEndsAt,
          subscriptionStatus: 'TRIALING',
          maxRooms: 5,
          maxUsers: 3,
          maxSuiteStates: 5,
        },
      });
      
      await tx.hotelMembership.create({
        data: {
          hotelId: hotel.id,
          userId: user.id,
          role: 'OWNER',
          joinedAt: new Date(),
        },
      });
      
      const refreshToken = crypto.randomBytes(32).toString('hex');
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      
      const session = await tx.userSession.create({
        data: {
          userId: user.id,
          activeHotelId: hotel.id,
          refreshToken: refreshTokenHash,
          expiresAt: new Date(Date.now() + 7 * 86400000),
        },
      });
      
      return { user, hotel, session, refreshToken };
    });
    
    const accessToken = this.signAccessToken({
      sub: result.user.id,
      role: result.user.role as UserRole,
      activeHotelId: result.hotel.id,
      sessionId: result.session.id,
    });
    
    return {
      accessToken,
      refreshToken: result.refreshToken,
      auth: await this.buildAuthResult(result.user.id, result.session.id, result.hotel.id),
    };
  }
  
  // ===========================================================================
  // CONNEXION
  // ===========================================================================
  async login(input: {
    email: string;
    password: string;
    totpCode?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<{ auth: AuthResult; accessToken: string; refreshToken: string }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        memberships: {
          where: { isActive: true, removedAt: null },
          include: { hotel: true },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    
    if (!user) throw new Error('Identifiants invalides');
    if (!user.isActive) throw new Error('Compte désactivé');
    
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new Error(`Compte verrouillé. Réessayez dans ${minutes} minutes.`);
    }
    
    const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordOk) {
      await this.recordFailedLogin(user.id);
      throw new Error('Identifiants invalides');
    }
    
    if (user.totpEnabled) {
      if (!input.totpCode) throw new Error('2FA_REQUIRED');
      if (!user.totpSecret) throw new Error('Configuration 2FA invalide');
      const totpValid = authenticator.verify({ token: input.totpCode, secret: user.totpSecret });
      if (!totpValid) throw new Error('Code 2FA invalide');
    }
    
    // Détermine hôtel actif par défaut
    const activeHotel = 
      user.memberships.find(m => m.role === 'OWNER')?.hotel ||
      user.memberships[0]?.hotel ||
      null;
    
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        activeHotelId: activeHotel?.id || null,
        refreshToken: refreshTokenHash,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
        expiresAt: new Date(Date.now() + 7 * 86400000),
        totpVerified: user.totpEnabled && !!input.totpCode,
      },
    });
    
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    
    const accessToken = this.signAccessToken({
      sub: user.id,
      role: user.role,
      activeHotelId: activeHotel?.id || null,
      sessionId: session.id,
    });
    
    return {
      accessToken,
      refreshToken,
      auth: await this.buildAuthResult(user.id, session.id, activeHotel?.id || null),
    };
  }
  
  // ===========================================================================
  // REFRESH
  // ===========================================================================
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const sessions = await prisma.userSession.findMany({
      where: { revokedAt: null, expiresAt: { gt: new Date() } },
    });
    
    let matchedSession: typeof sessions[0] | null = null;
    for (const session of sessions) {
      const ok = await bcrypt.compare(refreshToken, session.refreshToken);
      if (ok) { matchedSession = session; break; }
    }
    
    if (!matchedSession) throw new Error('Refresh token invalide');
    
    const user = await prisma.user.findUnique({ where: { id: matchedSession.userId } });
    if (!user || !user.isActive) throw new Error('Utilisateur inactif');
    
    const newRefreshToken = crypto.randomBytes(32).toString('hex');
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    
    await prisma.userSession.update({
      where: { id: matchedSession.id },
      data: { refreshToken: newRefreshTokenHash, lastSeenAt: new Date() },
    });
    
    const accessToken = this.signAccessToken({
      sub: user.id,
      role: user.role,
      activeHotelId: matchedSession.activeHotelId,
      sessionId: matchedSession.id,
    });
    
    return { accessToken, refreshToken: newRefreshToken };
  }
  
  // ===========================================================================
  // SWITCH HÔTEL
  // ===========================================================================
  async switchHotel(userId: string, hotelId: string, sessionId: string): Promise<{ accessToken: string }> {
    const membership = await prisma.hotelMembership.findFirst({
      where: { 
        userId, 
        hotelId, 
        isActive: true,
        removedAt: null,
      },
      include: { hotel: true },
    });
    
    if (!membership) throw new Error('Vous n\'avez pas accès à cet hôtel');
    if (!membership.hotel.isActive) throw new Error('Cet hôtel est désactivé');
    
    if (membership.role !== 'OWNER') {
      const expired = await this.isSubscriptionExpired(membership.hotel);
      if (expired) throw new Error('Abonnement expiré');
    }
    
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { activeHotelId: hotelId, lastSeenAt: new Date() },
    });
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User introuvable');
    
    const accessToken = this.signAccessToken({
      sub: user.id,
      role: user.role,
      activeHotelId: hotelId,
      sessionId,
    });
    
    return { accessToken };
  }
  
  // ===========================================================================
  // LOGOUT
  // ===========================================================================
  async logout(sessionId: string): Promise<void> {
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }
  
  // ===========================================================================
  // INVITATIONS
  // ===========================================================================
  async createInvitation(input: {
    hotelId: string;
    email: string;
    proposedRole: HotelRole;
    invitedById: string;
    message?: string;
  }): Promise<{ token: string; invitation: any; inviteUrl: string }> {
    const inviterMembership = await prisma.hotelMembership.findFirst({
      where: { 
        hotelId: input.hotelId, 
        userId: input.invitedById,
        role: { in: ['OWNER', 'MANAGER'] },
        isActive: true,
      },
    });
    
    if (!inviterMembership) throw new Error('Seul un OWNER ou MANAGER peut inviter');
    
    const existing = await prisma.hotelInvitation.findFirst({
      where: {
        hotelId: input.hotelId,
        email: input.email,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    
    if (existing) throw new Error('Une invitation est déjà en attente pour cet email');
    
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      include: { memberships: { where: { hotelId: input.hotelId, isActive: true } } },
    });
    
    if (existingUser?.memberships.length) {
      throw new Error('Cette personne est déjà membre');
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 86400000);
    
    const invitation = await prisma.hotelInvitation.create({
      data: {
        hotelId: input.hotelId,
        email: input.email,
        proposedRole: input.proposedRole,
        token,
        expiresAt,
        invitedById: input.invitedById,
        message: input.message,
      },
    });
    
    const hotel = await prisma.hotel.findUnique({ 
      where: { id: input.hotelId }, 
      select: { name: true } 
    });
    const inviter = await prisma.user.findUnique({ 
      where: { id: input.invitedById }, 
      select: { displayName: true, name: true } 
    });
    
    const inviteUrl = `${process.env.FRONTEND_URL}/invitation/${token}`;
    
    emailService.sendInvitation({
      to: input.email,
      inviteUrl,
      hotelName: hotel!.name,
      inviterName: inviter!.displayName || inviter!.name || 'Un administrateur',
      proposedRole: input.proposedRole,
      message: input.message,
    }).catch(console.error);
    
    return { token, invitation, inviteUrl };
  }
  
  async acceptInvitation(input: {
    token: string;
    password: string;
    displayName?: string;
  }): Promise<{ auth: AuthResult; accessToken: string; refreshToken: string }> {
    const invitation = await prisma.hotelInvitation.findUnique({
      where: { token: input.token },
      include: { hotel: true },
    });
    
    if (!invitation) throw new Error('Invitation introuvable');
    if (invitation.acceptedAt) throw new Error('Invitation déjà acceptée');
    if (invitation.revokedAt) throw new Error('Invitation révoquée');
    if (invitation.expiresAt < new Date()) throw new Error('Invitation expirée');
    
    let user = await prisma.user.findUnique({ where: { email: invitation.email } });
    
    if (!user) {
      if (!input.displayName) throw new Error('displayName requis');
      if (input.password.length < 12) throw new Error('Mot de passe trop court (12 min)');
      const passwordHash = await bcrypt.hash(input.password, 12);
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          passwordHash,
          displayName: input.displayName,
          role: 'HOTEL',
        },
      });
    } else {
      const ok = await bcrypt.compare(input.password, user.passwordHash);
      if (!ok) throw new Error('Mot de passe incorrect');
    }
    
    await prisma.hotelMembership.create({
      data: {
        hotelId: invitation.hotelId,
        userId: user.id,
        role: invitation.proposedRole,
        invitedById: invitation.invitedById,
        joinedAt: new Date(),
      },
    });
    
    await prisma.hotelInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });
    
    return this.login({
      email: user.email,
      password: input.password,
    });
  }
  
  // ===========================================================================
  // HELPERS
  // ===========================================================================
  signAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'fallback-secret', { expiresIn: ACCESS_TTL });
  }
  
  setAuthCookies(res: any, accessToken: string, refreshToken: string): void {
    res.cookie('zafir_access_token', accessToken, { ...baseCookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('zafir_refresh_token', refreshToken, { ...baseCookieOptions, maxAge: 7 * 86400000 });
  }
  
  clearAuthCookies(res: any): void {
    res.clearCookie('zafir_access_token', baseCookieOptions);
    res.clearCookie('zafir_refresh_token', baseCookieOptions);
  }
  
  async buildAuthResult(userId: string, _sessionId: string, activeHotelId: string | null): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { isActive: true, removedAt: null },
          include: { hotel: true },
        },
      },
    });
    
    if (!user) throw new Error('User introuvable');
    
    const activeMembership = activeHotelId
      ? user.memberships.find(m => m.hotelId === activeHotelId)
      : null;
    
    let activeHotel: AuthResult['activeHotel'] = null;
    
    if (activeMembership) {
      const trialEndsAt = activeMembership.hotel.trialEndsAt;
      const trialDaysLeft = trialEndsAt
        ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
        : null;
      
      let perms = [];
      try {
        perms = JSON.parse(activeMembership.permissions);
      } catch (e) {
        perms = [];
      }
      
      activeHotel = {
        id: activeMembership.hotel.id,
        name: activeMembership.hotel.name,
        slug: activeMembership.hotel.slug,
        plan: activeMembership.hotel.plan,
        subscriptionStatus: activeMembership.hotel.subscriptionStatus,
        role: activeMembership.role,
        permissions: this.computePermissions(activeMembership.role, perms),
        trialEndsAt: trialEndsAt?.toISOString() || null,
        trialDaysLeft,
      };
    }
    
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.name || '',
        role: user.role,
      },
      activeHotel,
      availableHotels: user.memberships.map(m => ({
        id: m.hotel.id,
        name: m.hotel.name,
        role: m.role,
      })),
    };
  }
  
  public computePermissions(role: HotelRole, customPerms: string[]): string[] {
    const basePerms = ROLE_PERMISSIONS[role] || [];
    return [...new Set([...basePerms, ...customPerms])];
  }
  
  private async recordFailedLogin(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    
    const newCount = user.failedLoginCount + 1;
    const update: any = { failedLoginCount: newCount };
    
    if (newCount >= MAX_FAILED_LOGINS) {
      update.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60_000);
    }
    
    await prisma.user.update({ where: { id: userId }, data: update });
  }
  
  private async isSubscriptionExpired(hotel: any): Promise<boolean> {
    if (hotel.plan === 'FREE_TRIAL' && hotel.trialEndsAt && hotel.trialEndsAt < new Date()) {
      return true;
    }
    if (['CANCELLED', 'UNPAID'].includes(hotel.subscriptionStatus)) return true;
    if (hotel.currentPeriodEnd && hotel.currentPeriodEnd < new Date()) return true;
    return false;
  }
  
  private async generateUniqueSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'hotel';
    
    let slug = base;
    let suffix = 0;
    while (await prisma.hotel.findUnique({ where: { slug } })) {
      suffix++;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }
  
  // Méthode publique pour vérifier les permissions
  hasPermission(permissions: string[], required: string): boolean {
    if (permissions.includes('*')) return true;
    if (permissions.includes(required)) return true;
    const [scope] = required.split('.');
    if (permissions.includes(`${scope}.*`)) return true;
    return false;
  }
}

export const authService = new AuthService();
