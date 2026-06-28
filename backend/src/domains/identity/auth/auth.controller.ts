/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { signAccessToken } from './jwt.js';
import { setAuthCookie, clearAuthCookie } from '../../../utils/cookies.js';
import { logAudit } from '../../audit/audit.service.js';
import { asyncHandler } from '../../../shared/errors/asyncHandler.js';
import { ApiError } from '../../../shared/errors/errorHandler.js';
import { adminAuth } from '../../../infrastructure/firebase-admin.js';
const loginSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase()),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase()),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  hotelName: z.string().min(1).optional(),
  hotelId: z.string().optional(), // Pour rejoindre un hôtel existant via invitation
});

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

async function createSessionAndToken(
  userId: string,
  activeHotelId: string | null,
  role: string,
  email: string,
  req: Request
) {
  const session = await prisma.userSession.create({
    data: {
      userId,
      userAgent: req.headers['user-agent'] ?? null,
      ipAddress: req.ip ?? null,
      activeHotelId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });

  const token = signAccessToken({
    userId,
    email,
    role: role as 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'CLIENT',
    hotelId: activeHotelId ?? '',
    activeHotelId: activeHotelId ?? undefined,
    sessionId: session.id,
  });

  return { session, token };
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      hotel: { select: { id: true, name: true, plan: true, trialEndsAt: true } },
      memberships: {
        include: { hotel: { select: { id: true, name: true, plan: true } } },
      },
    },
  });
  
  if (!user || !user.isActive) {
    await logAudit({
      actor: email,
      action: 'user.login_failed',
      resource: 'user',
      metadata: { 
        reason: !user ? 'user_not_found' : 'user_inactive',
        email, 
        ip: req.ip,
      },
    }, req);
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  
  if (!valid) {
    await logAudit({
      actor: user.id,
      action: 'user.login_failed',
      resource: 'user',
      resourceId: user.id,
      metadata: { reason: 'invalid_password', email, ip: req.ip },
    }, req);
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  // Déterminer l'hôtel actif (priorité: premier membership OWNER, puis hotelId direct)
  const activeHotelId = user.memberships[0]?.hotelId ?? user.hotelId ?? null;

  const { session, token } = await createSessionAndToken(
    user.id, activeHotelId, user.role, user.email, req
  );

  // Mettre à jour lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  
  setAuthCookie(res, token);
  
  await logAudit({
    actor: user.id,
    action: 'user.login',
    resource: 'user',
    resourceId: user.id,
    metadata: { 
      method: 'password', 
      ip: req.ip,
      userAgent: req.get('user-agent'),
      sessionId: session.id,
    },
  }, req);
  
  return res.json({
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      hotelId: user.hotelId,
      activeHotelId,
      sessionId: session.id,
      hotel: user.hotel,
      memberships: user.memberships.map(m => ({
        hotelId: m.hotelId,
        hotelName: m.hotel.name,
        role: m.role,
        plan: m.hotel.plan,
      })),
    },
  });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, hotelName, hotelId } = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'Cet email est déjà utilisé.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Créer l'utilisateur
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'CLIENT',
        isActive: true,
        // hotelId requis par le schéma — on le lie après création de l'hôtel
        hotelId: hotelId ?? '', // sera mis à jour si on crée un hôtel trial
      },
    });

    let activeHotelId: string;

    if (hotelId) {
      // Rejoindre un hôtel existant via invitation
      activeHotelId = hotelId;
      await tx.hotelMembership.create({
        data: { userId: user.id, hotelId, role: 'STAFF' },
      });
      await tx.user.update({ where: { id: user.id }, data: { hotelId } });
    } else {
      // Self-serve : créer un hôtel Trial
      const slugBase = (hotelName ?? `hotel-${user.id}`)
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
      const slug = `${slugBase}-${Date.now().toString(36)}`;

      const hotel = await tx.hotel.create({
        data: {
          name: hotelName ?? `Hôtel de ${firstName}`,
          slug,
          address: '',
          city: '',
          country: '',
          plan: 'FREE_TRIAL',
          trialEndsAt,
          isActive: true,
        },
      });

      await tx.hotelMembership.create({
        data: { userId: user.id, hotelId: hotel.id, role: 'OWNER', joinedAt: new Date() },
      });

      await tx.user.update({ where: { id: user.id }, data: { hotelId: hotel.id } });
      activeHotelId = hotel.id;
    }

    // 2. Créer la session
    const session = await tx.userSession.create({
      data: {
        userId: user.id,
        userAgent: req.headers['user-agent'] ?? null,
        ipAddress: req.ip ?? null,
        activeHotelId,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });

    return { user, activeHotelId, session };
  });

  const token = signAccessToken({
    userId: result.user.id,
    email: result.user.email,
    role: result.user.role as 'CLIENT',
    hotelId: result.activeHotelId,
    activeHotelId: result.activeHotelId,
    sessionId: result.session.id,
  });

  setAuthCookie(res, token);

  await logAudit({
    actor: result.user.id,
    action: 'user.register',
    resource: 'user',
    resourceId: result.user.id,
    metadata: { ip: req.ip, activeHotelId: result.activeHotelId },
  }, req);

  return res.status(201).json({
    accessToken: token,
    user: {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      role: result.user.role,
      activeHotelId: result.activeHotelId,
      sessionId: result.session.id,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Révoquer la session en DB
  if (req.sessionId) {
    await prisma.userSession.update({
      where: { id: req.sessionId },
      data: { revokedAt: new Date() },
    }).catch(() => { /* session déjà révoquée */ });
  }

  if (req.user) {
    await logAudit({
      actor: req.user.userId,
      action: 'user.logout',
      resource: 'user',
      resourceId: req.user.userId,
      metadata: { ip: req.ip, sessionId: req.sessionId },
    }, req);
  }
  
  clearAuthCookie(res);
  return res.json({ ok: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, 'Not authenticated');
  
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      hotel: { select: { id: true, name: true, plan: true, trialEndsAt: true } },
      memberships: {
        include: { hotel: { select: { id: true, name: true, plan: true, trialEndsAt: true } } },
      },
    },
  });
  
  if (!user) throw new ApiError(404, 'User not found');

  // Récupérer la session active pour connaître l'hôtel actif
  let activeHotelId = user.hotelId;
  if (req.sessionId) {
    const session = await prisma.userSession.findUnique({
      where: { id: req.sessionId },
      select: { activeHotelId: true },
    });
    if (session?.activeHotelId) activeHotelId = session.activeHotelId;
  }
  
  const { passwordHash: _, ...userSafe } = user;
  res.json({
    user: {
      ...userSafe,
      activeHotelId,
      sessionId: req.sessionId,
      memberships: user.memberships.map(m => ({
        hotelId: m.hotelId,
        hotelName: m.hotel.name,
        role: m.role,
        plan: m.hotel.plan,
        trialEndsAt: m.hotel.trialEndsAt,
      })),
    },
  });
});

// Endpoint dédié mobile (conservé pour compatibilité)
export const loginMobile = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      hotel: { select: { id: true, name: true } },
      memberships: { select: { hotelId: true } },
    },
  });
  
  if (!user || !user.isActive) {
    await logAudit({
      actor: email,
      action: 'user.login_failed',
      resource: 'user',
      metadata: { reason: 'mobile_user_not_found', email, ip: req.ip },
    }, req);
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await logAudit({
      actor: user.id,
      action: 'user.login_failed',
      resource: 'user',
      resourceId: user.id,
      metadata: { reason: 'mobile_invalid_password', email, ip: req.ip },
    }, req);
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
  
  const activeHotelId = user.memberships[0]?.hotelId ?? user.hotelId ?? null;
  const { session, token } = await createSessionAndToken(user.id, activeHotelId, user.role, user.email, req);
  
  await logAudit({
    actor: user.id,
    action: 'user.login_mobile',
    resource: 'user',
    resourceId: user.id,
    metadata: { method: 'password', ip: req.ip, userAgent: req.get('user-agent'), sessionId: session.id },
  }, req);
  
  const { passwordHash: _, ...userWithoutHash } = user;
  return res.json({ token, user: { ...userWithoutHash, activeHotelId, sessionId: session.id } });
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    throw new ApiError(400, 'Jeton Google manquant.');
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { email, uid, name, picture } = decodedToken;
    
    if (!email) {
      throw new ApiError(400, 'Email introuvable dans le jeton Google.');
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        hotel: { select: { id: true, name: true, plan: true, trialEndsAt: true } },
        memberships: {
          include: { hotel: { select: { name: true, plan: true, trialEndsAt: true } } },
        },
      },
    });

    if (!user) {
      // Create user if not exists
      const passwordHash = await bcrypt.hash(uid + Math.random().toString(), 12);
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      
      const nameParts = (name || 'Google User').split(' ');
      const firstName = nameParts[0] || 'Utilisateur';
      const lastName = nameParts.slice(1).join(' ') || 'Google';

      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            firstName,
            lastName,
            role: 'CLIENT',
            isActive: true,
            hotelId: '',
          },
        });

        const slugBase = `hotel-${newUser.id}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-').slice(0, 40);
        const slug = `${slugBase}-${Date.now().toString(36)}`;

        const hotel = await tx.hotel.create({
          data: {
            name: `Hôtel de ${firstName}`,
            slug,
            address: '',
            city: '',
            country: '',
            plan: 'FREE_TRIAL',
            trialEndsAt,
            isActive: true,
          },
        });

        await tx.hotelMembership.create({
          data: { userId: newUser.id, hotelId: hotel.id, role: 'OWNER' },
        });

        const updatedUser = await tx.user.update({
          where: { id: newUser.id },
          data: { hotelId: hotel.id },
          include: {
            hotel: { select: { id: true, name: true, plan: true, trialEndsAt: true } },
            memberships: {
              include: { hotel: { select: { name: true, plan: true, trialEndsAt: true } } },
            },
          }
        });

        return updatedUser;
      });
      user = result;
    }

    const activeHotelId = user.memberships[0]?.hotelId ?? user.hotelId ?? null;
    const { session, token } = await createSessionAndToken(user.id, activeHotelId, user.role, user.email, req);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    
    setAuthCookie(res, token);
    
    await logAudit({
      actor: user.id,
      action: 'user.login_google',
      resource: 'user',
      resourceId: user.id,
      metadata: { method: 'google', ip: req.ip, userAgent: req.get('user-agent'), sessionId: session.id },
    }, req);
    
    const { passwordHash: _, ...userSafe } = user;
    return res.json({
      accessToken: token,
      user: {
        ...userSafe,
        activeHotelId,
        sessionId: session.id,
        memberships: user.memberships.map(m => ({
          hotelId: m.hotelId,
          hotelName: m.hotel.name,
          role: m.role,
          plan: m.hotel.plan,
          trialEndsAt: m.hotel.trialEndsAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    throw new ApiError(401, 'Jeton Google invalide ou expiré.');
  }
});
