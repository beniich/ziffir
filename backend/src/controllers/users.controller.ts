import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { getTenantIdOrThrow } from '../shared/utils/tenant.js';
import { asyncHandler } from '../shared/errors/asyncHandler.js';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const users = await prisma.user.findMany({
    where: { hotelId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
  });
  res.json({ items: users, pagination: { total: users.length, page: 1, totalPages: 1 } });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const { email, password, firstName, lastName, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role, hotelId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
  });
  res.status(201).json({ user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const { firstName, lastName, role, isActive, password } = req.body;
  const data: any = { firstName, lastName, role, isActive };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  const user = await prisma.user.update({
    where: { id: req.params.id, hotelId },
    data,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
  });
  res.json({ user });
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const user = await prisma.user.update({
    where: { id: req.params.id, hotelId },
    data: { isActive: false },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
  });
  res.json({ user });
});
