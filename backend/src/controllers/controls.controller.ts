// backend/src/controllers/controls.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { broadcastUpdate } from '../websocket/ws.server';
import type { ApiResponse } from '../types';

const prisma = new PrismaClient();

export class ControlsController {
  static async getAll(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const controls = await prisma.suiteControl.findMany({
        orderBy: { suite: 'asc' },
      });
      res.json({ success: true, data: controls });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erreur récupération contrôles' });
    }
  }

  static async updateControl(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { id } = req.params;
      const patch = req.body;

      // Whitelist des champs modifiables
      const allowed = ['lights', 'climate', 'curtains', 'music', 'musicVolume', 'doNotDisturb'];
      const data: any = {};
      for (const key of allowed) {
        if (key in patch) data[key] = patch[key];
      }

      const updated = await prisma.suiteControl.update({
        where: { id },
        data,
      });

      broadcastUpdate({ type: 'SUITE_CONTROL_CHANGED', data: updated });
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erreur mise à jour contrôle' });
    }
  }
}
