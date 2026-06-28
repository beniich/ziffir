import type { Request, Response } from 'express';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { getTenantIdOrThrow } from '../shared/utils/tenant.js';
import { asyncHandler } from '../shared/errors/asyncHandler.js';
import { getIo } from '../lib/io.js';
import { socketEvents } from '../socket.js';

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const tasks = await prisma.task.findMany({
    where: { hotelId },
    include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
  });
  res.json({ items: tasks, pagination: { total: tasks.length, page: 1, totalPages: 1 } });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, hotelId },
    include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
  });
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json({ task });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const task = await prisma.task.create({
    data: { ...req.body, hotelId },
    include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
  });
  socketEvents.taskCreated(getIo(), hotelId, task);
  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: req.body,
    include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
  });
  socketEvents.taskUpdated(getIo(), hotelId, task);
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  await prisma.task.delete({ where: { id: req.params.id } });
  socketEvents.taskDeleted(getIo(), hotelId, req.params.id);
  res.json({ success: true });
});
