import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Au moins 8 caractères')
  .max(100)
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[a-z]/, 'Au moins une minuscule')
  .regex(/[0-9]/, 'Au moins un chiffre');

export const createUserSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  password: passwordSchema.optional(),  // Optional: can send invitation email instead
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  phone: z.string().max(30).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).default('STAFF'),
  sendInvitation: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  phone: z.string().max(30).nullable().optional(),
});

export const updateOwnProfileSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  phone: z.string().max(30).nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Le nouveau mot de passe doit être différent de l\'ancien',
  path: ['newPassword'],
});

export const adminResetPasswordSchema = z.object({
  sendEmail: z.boolean().default(true),
});

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'GUEST']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['createdAt', 'lastName', 'firstName', 'lastLoginAt']).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

export const userIdParamSchema = z.object({
  id: z.string().cuid('ID invalide'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
