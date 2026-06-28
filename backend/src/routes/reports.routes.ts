import { Router } from 'express';
import { generateReport } from '../controllers/reports.controller.js';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /api/reports:
 *   get:
 *     tags: [Reports]
 *     summary: Télécharger un rapport PDF
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [occupancy, tasks, revenue] }
 *     responses:
 *       200:
 *         description: PDF
 *         content:
 *           application/pdf: {}
 */
router.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), generateReport);

export default router;
