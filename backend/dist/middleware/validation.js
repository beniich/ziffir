"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
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
        req[source] = result.data;
        next();
    };
};
exports.validate = validate;
// ════════════════════════════════════════════════════════════
// SCHÉMAS RÉUTILISABLES
// ════════════════════════════════════════════════════════════
const passwordSchema = zod_1.z
    .string()
    .min(12, 'Le mot de passe doit faire au moins 12 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[\W_]/, 'Doit contenir au moins un caractère spécial');
const emailSchema = zod_1.z.string().email('Email invalide').max(100);
const usernameSchema = zod_1.z
    .string()
    .min(3, 'Minimum 3 caractères')
    .max(30, 'Maximum 30 caractères')
    .regex(/^[a-zA-Z0-9_]+$/, 'Caractères alphanumériques et underscore uniquement');
exports.schemas = {
    // ─── Auth ──────────────────────────────────────────
    register: zod_1.z.object({
        email: emailSchema,
        username: usernameSchema,
        password: passwordSchema,
        role: zod_1.z.enum(['operator', 'manager', 'admin']).default('operator'),
    }),
    login: zod_1.z.object({
        email: emailSchema,
        password: zod_1.z.string().min(1, 'Mot de passe requis'),
    }),
    refresh: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token requis'),
    }),
    // ─── Audits ─────────────────────────────────────────
    createAudit: zod_1.z.object({
        user: zod_1.z.string().min(1).max(100),
        role: zod_1.z.string().min(1).max(50),
        action: zod_1.z.string().min(1).max(200),
        reason: zod_1.z.string().min(1).max(500),
        status: zod_1.z.enum(['AUTHORIZED', 'BYPASS', 'RESTRICTED_ATTEMPT']),
    }),
    // ─── Room Service ───────────────────────────────────
    createOrder: zod_1.z.object({
        roomNumber: zod_1.z.string().min(1).max(20),
        guestName: zod_1.z.string().min(1).max(100),
        guestVIP: zod_1.z.boolean().optional().default(false),
        items: zod_1.z.array(zod_1.z.object({
            courseCode: zod_1.z.string().min(1).max(50),
            quantity: zod_1.z.number().int().min(1).max(20).default(1),
        })).min(1, 'Au moins un item requis'),
        notes: zod_1.z.string().max(500).optional(),
        priority: zod_1.z.enum(['low', 'normal', 'high']).default('normal'),
    }),
    // ─── Staff ──────────────────────────────────────────
    createStaff: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        role: zod_1.z.enum(['operator', 'manager', 'admin']),
        department: zod_1.z.string().min(1).max(50),
        clearanceLevel: zod_1.z.number().int().min(1).max(5).default(1),
    }),
    updateClearance: zod_1.z.object({
        clearanceLevel: zod_1.z.number().int().min(1).max(5),
    }),
    // ─── Ledger ─────────────────────────────────────────
    createCourse: zod_1.z.object({
        code: zod_1.z.string().min(2).max(20),
        name: zod_1.z.string().min(2).max(200),
        category: zod_1.z.enum(['Operations', 'Gastronomy', 'Service', 'Management']),
        credits: zod_1.z.number().min(0).max(20),
        grade: zod_1.z.enum(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']),
        completedDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
    }),
};
//# sourceMappingURL=validation.js.map