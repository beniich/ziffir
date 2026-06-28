/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { logAudit, verifyChain } from './audit.service.js';
import { asyncHandler } from '../../shared/errors/asyncHandler.js';
import { requireAuth } from '../identity/auth/auth.middleware.js';
import { requirePermission } from '../identity/rbac/rbac.middleware.js';

const listSchema = z.object({
  actor: z.string().optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  action: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const listEvents = asyncHandler(async (req: Request, res: Response) => {
  const { actor, resource, resourceId, action, from, to, page, pageSize } = listSchema.parse(req.query);
  
  const where: any = {};
  if (actor) where.actor = actor;
  if (resource) where.resource = resource;
  if (resourceId) where.resourceId = resourceId;
  if (action) where.action = action;
  if (from || to) {
    where.timestamp = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    };
  }
  
  const [items, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditEvent.count({ where }),
  ]);
  
  res.json({
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await prisma.auditEvent.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json({ event });
});

export const verifyIntegrity = asyncHandler(async (req: Request, res: Response) => {
  const result = await verifyChain();
  res.json(result);
});

export const exportEvents = asyncHandler(async (req: Request, res: Response) => {
  const events = await prisma.auditEvent.findMany({
    orderBy: { timestamp: 'asc' },
  });
  
  const csv = [
    'id,timestamp,actor,action,resource,resourceId,previousHash,hash',
    ...events.map(e => [
      e.id,
      e.timestamp.toISOString(),
      e.actor,
      e.action,
      e.resource,
      e.resourceId ?? '',
      e.previousHash,
      e.hash,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="audit-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send('\uFEFF' + csv);
});
