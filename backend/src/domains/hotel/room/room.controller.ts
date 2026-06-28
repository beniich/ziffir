import type { Request, Response } from 'express';
import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { getTenantIdOrThrow } from '../../../shared/utils/tenant.js';
import { asyncHandler } from '../../../shared/errors/asyncHandler.js';
import { getIo } from '../../../lib/io.js';
import { socketEvents } from '../../../socket.js';

export const listRooms = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const rooms = await prisma.room.findMany({ where: { hotelId } });
  res.json({ items: rooms, pagination: { total: rooms.length, page: 1, totalPages: 1 } });
});

export const getRoom = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const room = await prisma.room.findFirst({ where: { id: req.params.id, hotelId } });
  if (!room) return res.status(404).json({ error: 'Not found' });
  res.json({ room });
});

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const room = await prisma.room.create({ data: { ...req.body, hotelId } });
  socketEvents.roomCreated(getIo(), hotelId, room);
  res.status(201).json({ room });
});

export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const room = await prisma.room.update({ where: { id: req.params.id }, data: req.body });
  socketEvents.roomUpdated(getIo(), hotelId, room);
  res.json({ room });
});

export const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  await prisma.room.delete({ where: { id: req.params.id } });
  socketEvents.roomDeleted(getIo(), hotelId, req.params.id);
  res.json({ success: true });
});
