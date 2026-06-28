/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { asyncHandler } from '../../../shared/errors/asyncHandler.js';
import { trackEvent } from '../../../services/events.service.js';

// Mock sendEmail until we actually implement it in the project
const sendEmail = async (params: { to: string; subject: string; html: string }) => {
  console.log(`[Email] Sending to ${params.to} - ${params.subject}`);
};

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  hotels: z.string().optional(),
  role: z.string().optional(),
  source: z.enum(['demo_request', 'pricing', 'contact', 'free_trial', 'ebook', 'roi_calc', 'newsletter']),
  metadata: z.record(z.any()).optional(),
});

const listSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).optional(),
  source: z.string().optional(),
  search: z.string().optional(),
}).merge(z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}));

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const data = leadSchema.parse(req.body);
  
  // Lead scoring simple
  let score = 10;  // base
  if (data.hotels === '10+') score += 30;
  else if (data.hotels === '4-10') score += 20;
  else if (data.hotels === '2-3') score += 10;
  if (data.role === 'Owner' || data.role === 'Director') score += 20;
  if (data.role === 'Revenue') score += 15;
  
  const lead = await prisma.lead.create({
    data: {
      ...(data as any),
      score,
      ip: req.ip ?? null,
      userAgent: req.get('user-agent') ?? null,
      utmSource: (req.query.utm_source as string) ?? null,
      utmMedium: (req.query.utm_medium as string) ?? null,
      utmCampaign: (req.query.utm_campaign as string) ?? null,
    },
  });
  
  // Track event
  trackEvent({
    name: 'lead_created',
    properties: { source: data.source, score, role: data.role },
    userId: undefined,
    ip: req.ip,
  });
  
  // Notif interne Slack (à configurer)
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🎯 Nouveau lead : *${data.name}* (${data.email})\nSource : ${data.source} • Score : ${score}\nEntreprise : ${data.company ?? 'N/A'}`,
      }),
    }).catch(() => {});
  }
  
  // Email interne équipe
  await sendEmail({
    to: process.env.SALES_EMAIL ?? 'sales@sapphire.luxury',
    subject: `🎯 Nouveau lead : ${data.name} (${data.company ?? 'N/A'})`,
    html: `
      <h2>Nouveau lead</h2>
      <p><strong>${data.name}</strong> (${data.email})</p>
      <p>Source : ${data.source} • Score : ${score}/100</p>
      <p>Entreprise : ${data.company ?? 'N/A'}</p>
      <p>Rôle : ${data.role ?? 'N/A'}</p>
      <p>Hôtels : ${data.hotels ?? 'N/A'}</p>
    `,
  });
  
  // Email de confirmation au lead
  await sendEmail({
    to: data.email,
    subject: 'Merci pour votre intérêt pour Sapphire',
    html: `
      <h1>Merci ${data.name.split(' ')[0]} !</h1>
      <p>On revient vers vous sous 24h ouvrées.</p>
      <p>En attendant, vous pouvez :</p>
      <ul>
        <li><a href="https://sapphire.luxury/tools/roi-calculator">Calculer votre ROI potentiel</a></li>
        <li><a href="https://sapphire.luxury/docs">Lire la documentation</a></li>
      </ul>
    `,
  });
  
  res.status(201).json({ ok: true, score });
});

export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  const { status, source, search, ...pagination } = listSchema.parse(req.query);
  
  const where: any = {
    ...(status && { status }),
    ...(source && { source }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ],
    }),
  };
  
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.lead.count({ where }),
  ]);
  
  res.json({
    items: leads,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    },
  });
});

export const getLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) {
    res.status(404).json({ error: 'Lead introuvable' });
    return;
  }
  res.json({ lead });
});

export const updateLeadStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, notes } = z.object({
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).optional(),
    notes: z.string().optional(),
  }).parse(req.body);
  
  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status, ...(status === 'CONTACTED' && { contactedAt: new Date() })}),
      ...(notes !== undefined && { notes }),
    },
  });
  
  res.json({ lead });
});
