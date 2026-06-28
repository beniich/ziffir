import { prisma } from '../../infrastructure/database/prisma.client.js';
import { ApiError } from '../../shared/errors/errorHandler.js';
import { asyncHandler } from '../../shared/errors/asyncHandler.js';
import { requireAuth, requireRole } from '../identity/auth/auth.middleware.js';
import { assertSameHotel } from '../shared/middleware/tenant.middleware.js';
import { validate } from '../shared/middleware/validation.middleware.js';
import {
  createHotelSchema,
  updateHotelSchema,
  updateSettingsSchema,
  hotelIdParamSchema,
  listHotelsSchema,
} from './hotel.validation.js';
import * as svc from './hotel.service.js';

// =============================================================================
//  PUBLIC (authenticated) — own hotel
// =============================================================================

export const getMe = [
  requireAuth,
  asyncHandler(async (req, res) => {
    const hotel = await svc.getCurrentHotel(req.user!.hotelId);
    res.json({ hotel });
  }),
];

export const updateMe = [
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(updateHotelSchema),
  asyncHandler(async (req, res) => {
    // ADMIN can only update own hotel; SUPER_ADMIN can update any
    if (req.user!.role !== 'SUPER_ADMIN') {
      assertSameHotel(req, req.user!.hotelId);
    }
    const hotel = await svc.updateCurrentHotel(req.user!.hotelId, req.body, req);
    res.json({ hotel });
  }),
];

export const updateMySettings = [
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(updateSettingsSchema),
  asyncHandler(async (req, res) => {
    const hotel = await svc.updateHotelSettings(req.user!.hotelId, req.body, req);
    res.json({ hotel });
  }),
];

export const getMyStats = [
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const stats = await svc.getHotelStats(req.user!.hotelId);
    res.json({ stats });
  }),
];

// =============================================================================
//  SUPER_ADMIN — all hotels
// =============================================================================

export const create = [
  requireAuth,
  requireRole('SUPER_ADMIN'),
  validate(createHotelSchema),
  asyncHandler(async (req, res) => {
    const hotel = await svc.createHotel(req.body, req);
    res.status(201).json({ hotel });
  }),
];

export const list = [
  requireAuth,
  requireRole('SUPER_ADMIN'),
  validate(listHotelsSchema, 'query'),
  asyncHandler(async (req, res) => {
    const result = await svc.listHotels(req.query as any);
    res.json(result);
  }),
];

export const getById = [
  requireAuth,
  requireRole('SUPER_ADMIN'),
  validate(hotelIdParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const hotel = await svc.getHotelById(req.params.id);
    res.json({ hotel });
  }),
];

export const update = [
  requireAuth,
  requireRole('SUPER_ADMIN'),
  validate(hotelIdParamSchema, 'params'),
  validate(updateHotelSchema),
  asyncHandler(async (req, res) => {
    const before = await prisma.hotel.findUnique({ where: { id: req.params.id } });
    if (!before) throw new ApiError(404, 'Hôtel introuvable');
    const hotel = await svc.updateCurrentHotel(req.params.id, req.body, req);
    res.json({ hotel });
  }),
];

export const deactivate = [
  requireAuth,
  requireRole('SUPER_ADMIN'),
  validate(hotelIdParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const result = await svc.deactivateHotel(req.params.id, req);
    res.json(result);
  }),
];

export const reactivate = [
  requireAuth,
  requireRole('SUPER_ADMIN'),
  validate(hotelIdParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const hotel = await svc.reactivateHotel(req.params.id, req);
    res.json({ hotel });
  }),
];
