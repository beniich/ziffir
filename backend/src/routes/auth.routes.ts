import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { AuthV2Service } from '../services/auth-v2.service';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
// Note: In a true invitation-only system, public registration might be disabled.
// But we keep it here for legacy or Modèle 2 compatibility.
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const username = email.split('@')[0] + '_' + Date.now();

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        firstName: firstName || '',
        lastName: lastName || '',
        role: role || 'CLIENT',
      },
    });

    const session = await AuthV2Service.createSession(user.id, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    const tokens = {
      accessToken: AuthV2Service.generateAccessToken({
        userId: user.id,
        email: user.email,
        globalRole: user.role,
        sessionId: session.id,
      }),
      refreshToken: AuthV2Service.generateRefreshToken(user.id, session.id),
      expiresIn: 900,
    };

    return res.status(201).json({
      message: 'Registration successful',
      tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err: any) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    const result = await AuthV2Service.login(email, password, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    return res.json({
      message: 'Login successful',
      ...result
    });
  } catch (err: any) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: { hotel: true },
          where: { isActive: true },
        }
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      memberships: user.memberships.map((m) => ({
        hotelId: m.hotelId,
        hotelName: m.hotel.name,
        hotelSlug: m.hotel.slug,
        hotelRole: m.hotelRole,
      })),
      activeHotelId: (req as any).user.activeHotelId
    });
  } catch (err: any) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.body.refreshToken;

    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
    
    const tokens = await AuthV2Service.refresh(refreshToken);
    return res.json({ tokens });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = (req as any).user.sessionId;
    if (sessionId) {
      await AuthV2Service.revokeSession(sessionId, 'user_logout');
    }
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
