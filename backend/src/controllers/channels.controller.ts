import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { resolveHotelScope } from '../domains/identity/auth/auth.middleware.js';
import { asyncHandler } from '../shared/errors/asyncHandler.js';
import { ApiError } from '../shared/errors/errorHandler.js';
import { channelRegistry } from '../services/channels/registry.js';
import {
  pushAvailabilityForHotel,
  pullReservationsForHotel,
  fullSyncHotel,
} from '../services/channels/sync.service.js';
import { encryptJson } from '../lib/crypto.js';
import { parsePagination, buildPaginatedResponse, prismaSkipTake } from '../shared/utils/pagination.js';

const createSchema = z.object({
  type: z.enum(['BOOKING_COM', 'EXPEDIA', 'AIRBNB', 'AGODA', 'HOTELS_COM']),
  credentials: z.record(z.string()),
  autoPushAvailability: z.boolean().default(true),
  autoPushRates: z.boolean().default(true),
  autoPullReservations: z.boolean().default(true),
  markup: z.number().min(0).max(0.5).default(0),
});

export const listChannels = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  
  const channels = await prisma.channel.findMany({
    where: { hotelId },
    orderBy: { createdAt: 'desc' },
  });
  // On ne renvoie jamais les credentials en clair
  const sanitized = channels.map(c => ({ ...c, credentials: undefined }));
  res.json({ channels: sanitized });
});

export const getChannel = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  const channel = await prisma.channel.findFirst({ where: { id: req.params.id, hotelId } });
  if (!channel) throw new ApiError(404, 'Canal introuvable');
  res.json({ channel: { ...channel, credentials: undefined } });
});

export const createChannel = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  const data = createSchema.parse(req.body);
  
  const existing = await prisma.channel.findUnique({
    where: { hotelId_type: { hotelId, type: data.type } },
  });
  if (existing) throw new ApiError(409, 'Ce canal est déjà configuré');
  
  // Authentification
  const connector = channelRegistry.get(data.type);
  if (!connector) throw new ApiError(400, 'Type de canal non supporté');
  
  const authResult = await connector.authenticate(data.credentials);
  if (!authResult.success) {
    throw new ApiError(400, `Authentification échouée : ${authResult.error}`);
  }
  
  // Chiffrer les credentials
  const encryptedCreds = encryptJson(data.credentials);
  
  const channel = await prisma.channel.create({
    data: {
      hotelId,
      type: data.type,
      status: 'ACTIVE',
      externalHotelId: authResult.externalHotelId,
      credentials: encryptedCreds,
      config: { markup: data.markup },
      autoPushAvailability: data.autoPushAvailability,
      autoPushRates: data.autoPushRates,
      autoPullReservations: data.autoPullReservations,
    },
  });
  
  res.status(201).json({ channel: { ...channel, credentials: undefined } });
});

export const pauseChannel = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  const channel = await prisma.channel.update({
    where: { id: req.params.id },
    data: { status: 'PAUSED' },
  });
  res.json({ channel });
});

export const resumeChannel = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  const channel = await prisma.channel.update({
    where: { id: req.params.id },
    data: { status: 'ACTIVE', lastErrorMessage: null },
  });
  res.json({ channel });
});

export const deleteChannel = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  await prisma.channel.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export const pushNow = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  const results = await pushAvailabilityForHotel(hotelId);
  res.json({ results });
});

export const pullNow = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  const results = await pullReservationsForHotel(hotelId);
  res.json({ results });
});

export const fullSync = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  const results = await fullSyncHotel(hotelId);
  res.json(results);
});

export const getSyncLogs = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  const pagination = parsePagination(req.query);
  const [logs, total] = await Promise.all([
    prisma.channelSyncLog.findMany({
      where: { hotelId },
      include: { channel: { select: { type: true, externalHotelId: true } } },
      orderBy: { startedAt: 'desc' },
      ...prismaSkipTake(pagination),
    }),
    prisma.channelSyncLog.count({ where: { hotelId } }),
  ]);
  res.json(buildPaginatedResponse(logs, total, pagination));
});

export const getAvailableChannelTypes = asyncHandler(async (req: Request, res: Response) => {
  const types = channelRegistry.getAll().map(c => ({
    type: c.type,
    capabilities: c.capabilities,
    isMock: channelRegistry.isMock(),
  }));
  res.json({ types });
});
