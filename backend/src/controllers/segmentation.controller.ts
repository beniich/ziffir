import type { Request, Response } from 'express';
import { getTenantIdOrThrow } from '../shared/utils/tenant.js';
import { asyncHandler } from '../shared/errors/asyncHandler.js';
import { segmentGuests } from '../services/segmentation.service.js';

export const getSegments = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const data = await segmentGuests(hotelId);
  res.json(data);
});
