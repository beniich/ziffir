import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

const router = Router();

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'zaphir-fallback-secret';
const JWT_EXPIRES = '8h';

function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, hotelId } = req.body;
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
        hotelId: hotelId || null,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ message: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), failedAttempts: 0 },
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        stripePriceId: user.stripePriceId,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message || 'Login failed' });
  }
});

// GET /api/auth/me — validate token + return current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded: any = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        stripePriceId: user.stripePriceId,
        stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
      },
    });
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  return res.json({ message: 'Logged out successfully' });
});

export default router;
