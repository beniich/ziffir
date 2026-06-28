/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import { ApiError } from '../../shared/errors/errorHandler.js';
import { asyncHandler } from '../../shared/errors/asyncHandler.js';
import { requireAuth, requireRole } from '../identity/auth/auth.middleware.js';
import { validate } from '../shared/middleware/validation.middleware.js';
import { assertSameHotel } from '../shared/middleware/tenant.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  updateOwnProfileSchema,
  changePasswordSchema,
  adminResetPasswordSchema,
  updateRoleSchema,
  listUsersSchema,
  userIdParamSchema,
} from './user.validation.js';
import * as svc from './user.service.js';

// =============================================================================
// Self endpoints (any authenticated user)
// =============================================================================

export const getProfile = [
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await svc.getMyProfile(req.user!.userId);
    res.json({ user });
  }),
];

export const updateProfile = [
  requireAuth,
  validate(updateOwnProfileSchema),
  asyncHandler(async (req, res) => {
    const user = await svc.updateOwnProfile(req.user!.userId, req.body, req);
    res.json({ user });
  }),
];

export const changeMyPassword = [
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    await svc.changePassword(req.user!.userId, req.body, req);
    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  }),
];

// =============================================================================
// Admin management endpoints (ADMIN / SUPER_ADMIN)
// =============================================================================

export const list = [
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(listUsersSchema, 'query'),
  asyncHandler(async (req, res) => {
    const result = await svc.listUsers(req.user!.hotelId, req.query as any);
    res.json(result);
  }),
];

export const create = [
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const result = await svc.createUser(req.user!.hotelId, req.body, req);
    res.status(201).json(result);
  }),
];

export const getById = [
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(userIdParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const user = await svc.getUserById(req.params.id, req.user!.hotelId);
    res.json({ user });
  }),
];

export const update = [
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await svc.updateUser(req.params.id, req.user!.hotelId, req.body, req);
    res.json({ user });
  }),
];

export const deactivate = [
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(userIdParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const result = await svc.deleteUser(req.params.id, req.user!.hotelId, req);
    res.json(result);
  }),
];

export const changeRole = [
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(userIdParamSchema, 'params'),
  validate(updateRoleSchema),
  asyncHandler(async (req, res) => {
    const result = await svc.updateRole(req.params.id, req.user!.hotelId, req.body.role, req);
    res.json({ user: result });
  }),
];

export const resetPassword = [
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(userIdParamSchema, 'params'),
  validate(adminResetPasswordSchema),
  asyncHandler(async (req, res) => {
    const result = await svc.adminResetPassword(
      req.params.id,
      req.user!.hotelId,
      req.body.sendEmail,
      req
    );
    res.json(result);
  }),
];

export const toggleActive = [
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(userIdParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const result = await svc.toggleActiveStatus(req.params.id, req.user!.hotelId, req);
    res.json({ user: result });
  }),
];
