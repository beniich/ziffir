import type { Request, Response } from 'express';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { asyncHandler } from '../shared/errors/asyncHandler.js';
import { z } from 'zod';
import crypto from 'crypto';

const webhookSchema = z.object({
  url: z.string().url(),
  events: z.string().min(1), // ex: "reservation.created,invoice.paid"
  description: z.string().optional(),
});

export const listWebhooks = asyncHandler(async (req: Request, res: Response) => {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { hotelId: req.user!.hotelId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ endpoints });
});

export const createWebhook = asyncHandler(async (req: Request, res: Response) => {
  const parsed = webhookSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Secret HMAC généré automatiquement
  const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      hotelId: req.user!.hotelId,
      url: parsed.data.url,
      events: parsed.data.events,
      description: parsed.data.description,
      secret,
      status: 'ACTIVE',
    },
  });

  res.status(201).json({ endpoint });
});

export const deleteWebhook = asyncHandler(async (req: Request, res: Response) => {
  await prisma.webhookEndpoint.delete({
    where: {
      id: req.params.id,
      hotelId: req.user!.hotelId, // S'assure que l'hôtel ne supprime que ses propres webhooks
    },
  });
  res.json({ ok: true });
});

export const getWebhookLogs = asyncHandler(async (req: Request, res: Response) => {
  const logs = await prisma.webhookLog.findMany({
    where: {
      webhook: {
        id: req.params.id,
        hotelId: req.user!.hotelId,
      },
    },
    orderBy: { sentAt: 'desc' },
    take: 50,
  });
  res.json({ logs });
});
