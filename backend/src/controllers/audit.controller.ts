// src/controllers/audit.controller.ts

import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';
import type { ApiResponse } from '../types';

export class AuditController {
  /**
   * GET /api/audits
   */
  static async getAll(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 500, 1000);
      const audits = await AuditService.findAll(limit);
      res.json({ success: true, data: audits });
    } catch (error) {
      console.error('[AuditController.getAll]', error);
      res.status(500).json({ success: false, error: 'Erreur récupération audits' });
    }
  }

  /**
   * POST /api/audits
   */
  static async create(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { user, role, action, reason, status } = req.body;

      // Validation
      if (!user || !role || !action || !reason || !status) {
        return res.status(400).json({
          success: false,
          error: 'Champs requis manquants: user, role, action, reason, status',
        });
      }

      if (!['AUTHORIZED', 'BYPASS', 'RESTRICTED_ATTEMPT'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status invalide (doit être AUTHORIZED, BYPASS ou RESTRICTED_ATTEMPT)',
        });
      }

      const audit = await AuditService.create({ user, role, action, reason, status });
      res.status(201).json({ success: true, data: audit });
    } catch (error) {
      console.error('[AuditController.create]', error);
      res.status(500).json({ success: false, error: 'Erreur création audit' });
    }
  }

  /**
   * GET /api/audits/verify
   * Vérifie l'intégrité de la chaîne.
   */
  static async verify(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const result = await AuditService.verifyIntegrity();
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('[AuditController.verify]', error);
      res.status(500).json({ success: false, error: 'Erreur vérification chaîne' });
    }
  }
}
