/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { getTenantIdOrThrow } from '../../../shared/utils/tenant.js';
import { asyncHandler } from '../../../shared/errors/asyncHandler.js';
import { ApiError } from '../../../shared/errors/errorHandler.js';
import {
  buildPaginatedResponse,
  prismaSkipTake,
} from '../../../shared/utils/pagination.js';
import {
  startTask,
  completeTask,
  inspectTask,
  createStayoverTask,
} from '../../../services/housekeeping.service.js';
import { uploadToStorage } from '../../../services/storage.service.js';
import type { Prisma, HousekeepingStatus, HousekeepingType } from '@prisma/client';

const listSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'INSPECTED', 'REJECTED']).optional(),
  type: z.enum(['CHECKOUT_CLEAN', 'STAYOVER', 'DEEP_CLEAN', 'INSPECTION', 'TURNDOWN']).optional(),
  assigneeId: z.string().cuid().optional(),
  roomId: z.string().cuid().optional(),
  overdue: z.coerce.boolean().optional(),
}).merge(z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
}));

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const { status, type, assigneeId, roomId, overdue, ...paginationRaw } = listSchema.parse(req.query);
  const pagination = paginationRaw as { page: number; pageSize: number };
  
  const where: Prisma.HousekeepingTaskWhereInput = {
    hotelId,
    ...(status && { status }),
    ...(type && { type }),
    ...(assigneeId && { assigneeId }),
    ...(roomId && { roomId }),
    ...(overdue && {
      dueAt: { lt: new Date() },
      status: { not: 'INSPECTED' },
    }),
  };
  
  const [tasks, total] = await Promise.all([
    prisma.housekeepingTask.findMany({
      where,
      include: {
        room: { select: { id: true, number: true, type: true, floor: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
        reservation: { select: { id: true, guest: { select: { firstName: true, lastName: true } } } },
        _count: { select: { photos: true } },
      },
      orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }],
      ...prismaSkipTake(pagination),
    }),
    prisma.housekeepingTask.count({ where }),
  ]);
  
  res.json(buildPaginatedResponse(tasks, total, pagination));
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const task = await prisma.housekeepingTask.findFirst({
    where: { id: req.params.id, hotelId },
    include: {
      room: true,
      assignee: { select: { id: true, firstName: true, lastName: true } },
      inspectedBy: { select: { id: true, firstName: true, lastName: true } },
      reservation: { include: { guest: true } },
      photos: { orderBy: { takenAt: 'desc' } },
    },
  });
  if (!task) throw new ApiError(404, 'Tâche introuvable');
  res.json({ task });
});

export const startTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const task = await startTask(req.params.id, hotelId, req.user!.userId);
  res.json({ task });
});

export const completeTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const payload = z.object({
    checklist: z.record(z.boolean()).optional(),
    notes: z.string().max(1000).optional(),
    issueReported: z.boolean().optional(),
    issueDescription: z.string().max(1000).optional(),
  }).parse(req.body);
  const task = await completeTask(req.params.id, hotelId, req.user!.userId, payload);
  
  if ('audit' in req && typeof (req as any).audit === 'function') {
    await (req as any).audit({
      action: 'UPDATE',
      resource: 'HousekeepingTask',
      resourceId: task.id,
      metadata: { 
        action: 'complete',
        issueReported: payload.issueReported ?? false,
      },
    });
  }
  
  res.json({ task });
});

export const inspectTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const payload = z.object({
    approved: z.boolean(),
    notes: z.string().max(1000).optional(),
  }).parse(req.body);
  const task = await inspectTask(req.params.id, hotelId, req.user!.userId, payload as any);
  
  if ('audit' in req && typeof (req as any).audit === 'function') {
    await (req as any).audit({
      action: 'UPDATE',
      resource: 'HousekeepingTask',
      resourceId: task.id,
      metadata: { 
        action: payload.approved ? 'inspect_approved' : 'inspect_rejected',
      },
    });
  }
  
  res.json({ task });
});

export const createStayoverHandler = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const payload = z.object({
    roomId: z.string().cuid(),
    dueInHours: z.number().int().min(0).max(24).optional(),
    assigneeId: z.string().cuid().optional(),
    notes: z.string().max(500).optional(),
  }).parse(req.body);
  const task = await createStayoverTask(payload.roomId, hotelId, payload);
  res.status(201).json({ task });
});

/**
 * Upload de photo (multipart) — utilise multer en mémoire puis upload S3/R2.
 */
export const uploadPhotoHandler = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const taskId = req.params.id;
  
  const task = await prisma.housekeepingTask.findFirst({ where: { id: taskId, hotelId } });
  if (!task) throw new ApiError(404, 'Tâche introuvable');
  
  // req.file fourni par multer
  const file = (req as any).file;
  if (!file) throw new ApiError(400, 'Aucun fichier fourni');
  
  const { url, key } = await uploadToStorage(file, `hotels/${hotelId}/housekeeping/${taskId}`);
  
  const photo = await prisma.housekeepingPhoto.create({
    data: {
      taskId,
      url,
      key,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      caption: req.body.caption,
      uploadedById: req.user!.userId,
    },
  });
  
  res.status(201).json({ photo });
});

/**
 * Stats pour le dashboard mobile du personnel.
 */
export const getMyStats = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const userId = req.user!.userId;
  
  const [pending, inProgress, completedToday, overdue] = await Promise.all([
    prisma.housekeepingTask.count({ where: { assigneeId: userId, hotelId, status: 'PENDING' } }),
    prisma.housekeepingTask.count({ where: { assigneeId: userId, hotelId, status: 'IN_PROGRESS' } }),
    prisma.housekeepingTask.count({
      where: {
        assigneeId: userId,
        hotelId,
        status: { in: ['COMPLETED', 'INSPECTED'] },
        completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.housekeepingTask.count({
      where: {
        assigneeId: userId,
        hotelId,
        status: { not: 'INSPECTED' },
        dueAt: { lt: new Date() },
      },
    }),
  ]);
  
  res.json({ pending, inProgress, completedToday, overdue });
});
