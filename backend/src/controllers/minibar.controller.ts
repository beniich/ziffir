import type { Request, Response } from 'express';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { getTenantIdOrThrow } from '../shared/utils/tenant.js';
import { asyncHandler } from '../shared/errors/asyncHandler.js';
import { getIo } from '../lib/io.js';
import { socketEvents } from '../socket.js';

export const listMinibarItems = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const items = await prisma.miniBarItem.findMany({ where: { hotelId } });
  res.json({ items, pagination: { total: items.length, page: 1, totalPages: 1 } });
});

export const getMinibarItem = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const item = await prisma.miniBarItem.findFirst({ where: { id: req.params.id, hotelId } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ item });
});

export const createMinibarItem = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const item = await prisma.miniBarItem.create({ data: { ...req.body, hotelId } });
  socketEvents.minibarItemCreated(getIo(), hotelId, item);
  res.status(201).json({ item });
});

export const updateMinibarItem = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const item = await prisma.miniBarItem.update({ where: { id: req.params.id }, data: req.body });
  socketEvents.minibarItemUpdated(getIo(), hotelId, item);
  res.json({ item });
});

export const deleteMinibarItem = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  await prisma.miniBarItem.delete({ where: { id: req.params.id } });
  socketEvents.minibarItemDeleted(getIo(), hotelId, req.params.id);
  res.json({ success: true });
});
