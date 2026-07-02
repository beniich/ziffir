import { Router } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { requireAuth } from '../../middleware/cookieAuth';
import { auditService } from '../shared/services/audit.service';

const router = Router();

// POST /api/auth/register
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, 'Mot de passe : 12 caractères minimum'),
  displayName: z.string().min(2),
  hotelName: z.string().min(2),
  phone: z.string().optional(),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { 
        message: 'Données invalides', 
        details: parsed.error.flatten() 
      },
    });
  }
  
  try {
    const { accessToken, refreshToken, auth } = await authService.register(parsed.data);
    authService.setAuthCookies(res, accessToken, refreshToken);
    
    await auditService.append({
      eventType: 'auth.register',
      tenantId: auth.activeHotel?.id,
      actorId: auth.user.id,
      actorType: 'user',
      action: 'user.register',
      metadata: { email: auth.user.email, hotelName: auth.activeHotel?.name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json({ success: true, data: auth });
  } catch (e: any) {
    res.status(400).json({ success: false, error: { message: e.message } });
  }
});

// POST /api/auth/login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().optional(),
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { message: 'Données invalides' } });
  }
  
  try {
    const { accessToken, refreshToken, auth } = await authService.login({
      ...parsed.data,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    authService.setAuthCookies(res, accessToken, refreshToken);
    
    await auditService.append({
      eventType: 'auth.login',
      tenantId: auth.activeHotel?.id,
      actorId: auth.user.id,
      actorType: 'user',
      action: 'user.login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json({ success: true, data: auth });
  } catch (e: any) {
    if (e.message === '2FA_REQUIRED') {
      return res.json({ success: true, data: { requiresTotp: true } });
    }
    res.status(401).json({ success: false, error: { message: e.message } });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.zafir_refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ success: false, error: { message: 'No refresh token' } });
  }
  
  try {
    const tokens = await authService.refresh(refreshToken);
    authService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json({ success: true });
  } catch (e: any) {
    authService.clearAuthCookies(res);
    res.status(401).json({ success: false, error: { message: e.message } });
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req: any, res) => {
  await authService.logout(req.auth.sessionId);
  authService.clearAuthCookies(res);
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: any, res) => {
  const auth = await authService.buildAuthResult(
    req.auth.sub,
    req.auth.sessionId,
    req.auth.activeHotelId
  );
  res.json({ success: true, data: auth });
});

// POST /api/auth/team/hotels/:hotelId/switch
router.post('/team/hotels/:hotelId/switch', requireAuth, async (req: any, res) => {
  try {
    const { accessToken } = await authService.switchHotel(
      req.auth.sub,
      req.params.hotelId,
      req.auth.sessionId
    );
    
    res.cookie('zafir_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
    
    const auth = await authService.buildAuthResult(
      req.auth.sub,
      req.auth.sessionId,
      req.params.hotelId
    );
    
    res.json({ success: true, data: auth });
  } catch (e: any) {
    res.status(403).json({ success: false, error: { message: e.message } });
  }
});

// POST /api/auth/team/invitations
const inviteSchema = z.object({
  hotelId: z.string(),
  email: z.string().email(),
  proposedRole: z.enum([
    'OWNER', 'MANAGER', 'SOMMELIER', 'CONCIERGE', 'RECEPTION',
    'HOUSEKEEPING', 'KITCHEN', 'STAFF', 'VIEWER'
  ]),
  message: z.string().optional(),
});

router.post('/team/invitations', requireAuth, async (req: any, res) => {
  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { message: 'Données invalides' } });
  }
  
  try {
    const result = await authService.createInvitation({
      ...parsed.data,
      invitedById: req.auth.sub,
    });
    
    await auditService.append({
      eventType: 'team.invite',
      tenantId: parsed.data.hotelId,
      actorId: req.auth.sub,
      actorType: 'user',
      action: 'invitation.create',
      metadata: {
        email: parsed.data.email,
        role: parsed.data.proposedRole,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json({ success: true, data: result });
  } catch (e: any) {
    res.status(400).json({ success: false, error: { message: e.message } });
  }
});

// POST /api/auth/invitation/:token/accept
const acceptSchema = z.object({
  password: z.string().min(12),
  displayName: z.string().min(2).optional(),
});

router.post('/invitation/:token/accept', async (req, res) => {
  const parsed = acceptSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { message: 'Données invalides' } });
  }
  
  try {
    const { accessToken, refreshToken, auth } = await authService.acceptInvitation({
      token: req.params.token,
      password: parsed.data.password,
      displayName: parsed.data.displayName,
    });
    
    authService.setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true, data: auth });
  } catch (e: any) {
    res.status(400).json({ success: false, error: { message: e.message } });
  }
});

export default router;
