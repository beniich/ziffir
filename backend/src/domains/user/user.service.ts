import bcrypt from 'bcrypt';
import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../shared/errors/errorHandler.js';
import { encryptPII } from '../../lib/crypto.js';
import { logAudit } from '../audit/audit.service.js';
import { buildPagination, getSkip } from '../shared/utils/pagination.js';
import { buildSearchFilter } from '../shared/utils/query.js';
import { emailService, emailTemplates } from '../../infrastructure/email.js';
import type {
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput,
} from './user.validation.js';
import type { Request } from 'express';

// =============================================================================
// Helper: generate temporary password
// =============================================================================
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// =============================================================================
// LIST USERS
// =============================================================================
export async function listUsers(hotelId: string, params: {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  isActive?: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}) {
  const where: Prisma.UserWhereInput = {
    hotelId,
    ...(params.role && { role: params.role as Role }),
    ...(params.isActive !== undefined && { isActive: params.isActive === 'true' }),
    ...buildSearchFilter(['firstName', 'lastName', 'email'], params.search),
  };

  const orderBy = { [params.sortBy]: params.sortDir } as Prisma.UserOrderByWithRelationInput;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: getSkip(params.page, params.pageSize),
      take: params.pageSize,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    pagination: buildPagination(params.page, params.pageSize, total),
  };
}

// =============================================================================
// GET USER BY ID
// =============================================================================
export async function getUserById(id: string, hotelId: string) {
  const user = await prisma.user.findFirst({
    where: { id, hotelId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      emailVerifiedAt: true,
      twoFactorEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  return user;
}

// =============================================================================
// GET MY PROFILE
// =============================================================================
export async function getMyProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      hotel: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  return user;
}

// =============================================================================
// CREATE USER (invite)
// =============================================================================
export async function createUser(
  hotelId: string,
  input: CreateUserInput,
  req?: Request
) {
  // Check email uniqueness globally (emails are unique)
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ApiError(409, 'Cet email est déjà utilisé');

  let passwordHash: string;
  let tempPassword: string | null = null;
  let invitationSent = false;

  if (input.password) {
    // Password provided: hash it
    passwordHash = await bcrypt.hash(input.password, env.BCRYPT_COST);
  } else if (input.sendInvitation) {
    // Generate temp password + send invitation
    tempPassword = generateTempPassword();
    passwordHash = await bcrypt.hash(tempPassword, env.BCRYPT_COST);
    invitationSent = true;
  } else {
    throw new ApiError(400, 'Mot de passe requis ou sendInvitation=true');
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ? encryptPII(input.phone) : null,
      role: input.role,
      hotelId,
      emailVerifiedAt: invitationSent ? new Date() : null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  // Send invitation email
  if (invitationSent && tempPassword) {
    const email = emailTemplates.temporaryPassword({
      userName: `${user.firstName} ${user.lastName}`,
      tempPassword,
      loginUrl: `${env.FRONTEND_URL}/login`,
    });

    const result = await emailService.send({
      ...email,
      to: user.email,
    });

    if (!result.success) {
      console.error('⚠️  Invitation email failed:', result.error);
    }
  }

  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'USER_REGISTERED',
    resource: 'user',
    resourceId: user.id,
    after: {
      id: user.id,
      email: user.email,
      role: user.role,
      hotelId: hotelId,
      invitationSent,
    },
  }, req);

  return { user, invitationSent };
}

// =============================================================================
// UPDATE USER
// =============================================================================
export async function updateUser(
  id: string,
  hotelId: string,
  input: UpdateUserInput,
  req?: Request
) {
  const before = await prisma.user.findFirst({
    where: { id, hotelId },
    select: { firstName: true, lastName: true, phone: true },
  });
  if (!before) throw new ApiError(404, 'Utilisateur introuvable');

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.phone !== undefined && { phone: input.phone ? encryptPII(input.phone) : null }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'USER_REGISTERED', // No dedicated USER_UPDATED; using similar action
    resource: 'user',
    resourceId: id,
    before,
    after: { firstName: user.firstName, lastName: user.lastName },
    metadata: { type: 'profile_update' },
  }, req);

  return user;
}

// =============================================================================
// UPDATE OWN PROFILE
// =============================================================================
export async function updateOwnProfile(
  userId: string,
  input: UpdateUserInput,
  req?: Request
) {
  const before = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, phone: true },
  });
  if (!before) throw new ApiError(404, 'Utilisateur introuvable');

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.phone !== undefined && { phone: input.phone ? encryptPII(input.phone) : null }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      updatedAt: true,
    },
  });

  await logAudit({
    actor: userId,
    action: 'USER_REGISTERED',
    resource: 'user',
    resourceId: userId,
    before,
    after: { firstName: user.firstName, lastName: user.lastName },
    metadata: { type: 'self_profile_update' },
  }, req);

  return user;
}

// =============================================================================
// CHANGE OWN PASSWORD
// =============================================================================
export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
  req?: Request
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, email: true, firstName: true },
  });
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Mot de passe actuel incorrect');

  const newHash = await bcrypt.hash(input.newPassword, env.BCRYPT_COST);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  await logAudit({
    actor: userId,
    action: 'PASSWORD_CHANGED',
    resource: 'user',
    resourceId: userId,
    metadata: { type: 'self_change' },
  }, req);

  return { success: true };
}

// =============================================================================
// ADMIN RESET PASSWORD
// =============================================================================
export async function adminResetPassword(
  targetUserId: string,
  hotelId: string,
  sendEmail: boolean,
  req?: Request
) {
  const target = await prisma.user.findFirst({
    where: { id: targetUserId, hotelId },
    select: { id: true, email: true, firstName: true, role: true },
  });
  if (!target) throw new ApiError(404, 'Utilisateur introuvable');

  // Prevent resetting own password via this endpoint
  if (target.id === req?.user?.userId) {
    throw new ApiError(400, 'Utilisez /change-password pour votre propre compte');
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, env.BCRYPT_COST);

  await prisma.user.update({
    where: { id: targetUserId },
    data: { passwordHash },
  });

  if (sendEmail) {
    const email = emailTemplates.temporaryPassword({
      userName: `${target.firstName}`,
      tempPassword,
      loginUrl: `${env.FRONTEND_URL}/login`,
    });

    const result = await emailService.send({
      ...email,
      to: target.email,
    });

    if (!result.success) {
      console.error('⚠️  Reset email failed:', result.error);
    }
  }

  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'PASSWORD_CHANGED',
    resource: 'user',
    resourceId: targetUserId,
    metadata: { type: 'admin_reset', sendEmail },
  }, req);

  return { tempPassword };
}

// =============================================================================
// TOGGLE ACTIVE STATUS
// =============================================================================
export async function toggleActiveStatus(
  targetUserId: string,
  hotelId: string,
  req?: Request
) {
  const target = await prisma.user.findFirst({
    where: { id: targetUserId, hotelId },
    select: { id: true, isActive: true },
  });
  if (!target) throw new ApiError(404, 'Utilisateur introuvable');

  if (target.id === req?.user?.userId) {
    throw new ApiError(400, 'Vous ne pouvez pas désactiver votre propre compte');
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive: !target.isActive },
    select: { id: true, isActive: true },
  });

  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'USER_REGISTERED', // reusing USER_REGISTERED for audit
    resource: 'user',
    resourceId: targetUserId,
    before: { isActive: target.isActive },
    after: { isActive: updated.isActive },
    metadata: { type: 'toggle_active' },
  }, req);

  return updated;
}

// =============================================================================
// UPDATE ROLE
// =============================================================================
export async function updateRole(
  targetUserId: string,
  hotelId: string,
  newRole: Role,
  req?: Request
) {
  const target = await prisma.user.findFirst({
    where: { id: targetUserId, hotelId },
    select: { id: true, role: true },
  });
  if (!target) throw new ApiError(404, 'Utilisateur introuvable');

  if (target.id === req?.user?.userId) {
    throw new ApiError(400, 'Vous ne pouvez pas modifier votre propre rôle');
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
    select: { id: true, role: true },
  });

  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'USER_REGISTERED',
    resource: 'user',
    resourceId: targetUserId,
    before: { role: target.role },
    after: { role: updated.role },
    metadata: { type: 'role_change' },
  }, req);

  return updated;
}

// =============================================================================
// DEACTIVATE USER (soft delete or full deletion)
// =============================================================================
export async function deleteUser(
  targetUserId: string,
  hotelId: string,
  req?: Request
) {
  const target = await prisma.user.findFirst({
    where: { id: targetUserId, hotelId },
    select: { id: true, isActive: true },
  });
  if (!target) throw new ApiError(404, 'Utilisateur introuvable');

  if (target.id === req?.user?.userId) {
    throw new ApiError(400, 'Vous ne pouvez pas supprimer votre propre compte');
  }

  // Perform soft delete (deactivate)
  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive: false },
    select: { id: true, isActive: true },
  });

  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'USER_REGISTERED',
    resource: 'user',
    resourceId: targetUserId,
    metadata: { type: 'deactivate_delete' },
  }, req);

  return updated;
}
