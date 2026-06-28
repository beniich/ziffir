import type { Request, Response } from 'express';
import { asyncHandler } from '../shared/errors/asyncHandler.js';
import * as affiliateService from '../services/affiliate.service.js';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// ─── Publique ──────────────────────────────────────────────────────────────

const signupSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  company: z.string().optional(),
  password: z.string().min(8),
  payoutMethod: z.string().optional(),
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  let data: ReturnType<typeof signupSchema.parse>;
  try {
    data = signupSchema.parse(req.body);
  } catch (e: any) {
    return res.status(400).json({ error: e.flatten?.() ?? e.message });
  }

  const existing = await prisma.affiliate.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const affiliate = await affiliateService.createAffiliate(data as any);
  res.status(201).json({ message: 'Affiliate created', id: affiliate.id });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const affiliate = await prisma.affiliate.findUnique({ where: { email: email?.toLowerCase() } });
  if (!affiliate || !affiliate.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, affiliate.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  if (affiliate.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'Account not active. Status: ' + affiliate.status });
  }

  const token = jwt.sign({ affiliateId: affiliate.id }, env.JWT_SECRET, { expiresIn: '7d' });
  
  await prisma.affiliate.update({
    where: { id: affiliate.id },
    data: { lastLoginAt: new Date() },
  });

  res.json({ token, affiliate: { id: affiliate.id, name: affiliate.firstName, code: affiliate.code } });
});

export const trackClick = asyncHandler(async (req: Request, res: Response) => {
  const code = req.query.ref as string;
  if (!code) return res.status(400).json({ error: 'No ref code' });

  const affiliate = await affiliateService.trackClick(code);
  if (!affiliate) return res.status(404).json({ error: 'Invalid ref code' });

  res.json({ valid: true, code: affiliate.code });
});

// ─── Protégé Affilié ────────────────────────────────────────────────────────

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  // L'ID de l'affilié est injecté par un middleware d'auth spécifique ou extrait du token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { affiliateId: string };
    const stats = await affiliateService.getAffiliateStats(payload.affiliateId);
    
    // Ne pas renvoyer le hash
    const { passwordHash: _passwordHash, ...safeAffiliate } = stats.affiliate;
    
    res.json({ ...stats, affiliate: safeAffiliate });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ─── Admin (Protégé requireSuperAdmin) ───────────────────────────────────────

export const listAffiliates = asyncHandler(async (_req: Request, res: Response) => {
  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ affiliates });
});

export const approveAffiliate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const affiliate = await prisma.affiliate.update({
    where: { id },
    data: { status: 'ACTIVE', approvedAt: new Date() }, // approvedById pourrait être req.user.id
  });
  res.json({ affiliate });
});
