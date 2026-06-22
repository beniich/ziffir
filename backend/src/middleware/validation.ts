import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }

    // Remplace par les données validées/transformées (strip des champs non whitelistés)
    (req as any)[source] = result.data;
    next();
  };
};

// ════════════════════════════════════════════════════════════
// SCHÉMAS RÉUTILISABLES
// ════════════════════════════════════════════════════════════

const passwordSchema = z
  .string()
  .min(12, 'Le mot de passe doit faire au moins 12 caractères')
  .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
  .regex(/[\W_]/, 'Doit contenir au moins un caractère spécial');

const emailSchema = z.string().email('Email invalide').max(100);

const usernameSchema = z
  .string()
  .min(3, 'Minimum 3 caractères')
  .max(30, 'Maximum 30 caractères')
  .regex(/^[a-zA-Z0-9_]+$/, 'Caractères alphanumériques et underscore uniquement');

export const schemas = {
  // ─── Auth ──────────────────────────────────────────
  register: z.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    role: z.enum(['operator', 'manager', 'admin']).default('operator'),
  }),

  login: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Mot de passe requis'),
  }),

  refresh: z.object({
    refreshToken: z.string().min(1, 'Refresh token requis'),
  }),

  // ─── Audits ─────────────────────────────────────────
  createAudit: z.object({
    user: z.string().min(1).max(100),
    role: z.string().min(1).max(50),
    action: z.string().min(1).max(200),
    reason: z.string().min(1).max(500),
    status: z.enum(['AUTHORIZED', 'BYPASS', 'RESTRICTED_ATTEMPT']),
  }),

  // ─── Room Service ───────────────────────────────────
  createOrder: z.object({
    roomNumber: z.string().min(1).max(20),
    guestName: z.string().min(1).max(100),
    guestVIP: z.boolean().optional().default(false),
    items: z.array(z.object({
      courseCode: z.string().min(1).max(50),
      quantity: z.number().int().min(1).max(20).default(1),
    })).min(1, 'Au moins un item requis'),
    notes: z.string().max(500).optional(),
    priority: z.enum(['low', 'normal', 'high']).default('normal'),
  }),

  // ─── Staff ──────────────────────────────────────────
  createStaff: z.object({
    name: z.string().min(1).max(100),
    role: z.enum(['operator', 'manager', 'admin']),
    department: z.string().min(1).max(50),
    clearanceLevel: z.number().int().min(1).max(5).default(1),
  }),

  updateClearance: z.object({
    clearanceLevel: z.number().int().min(1).max(5),
  }),

  // ─── Ledger ─────────────────────────────────────────
  createCourse: z.object({
    code: z.string().min(2).max(20),
    name: z.string().min(2).max(200),
    category: z.enum(['Operations', 'Gastronomy', 'Service', 'Management']),
    credits: z.number().min(0).max(20),
    grade: z.enum(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']),
    completedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  }),
};
