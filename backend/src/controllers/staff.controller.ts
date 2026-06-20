// src/controllers/staff.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SanitizeService } from '../services/sanitize.service';
import type { ApiResponse } from '../types';

const prisma = new PrismaClient();

export class StaffController {
  static async getAll(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const staff = await prisma.staffMember.findMany({
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: staff });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erreur récupération staff' });
    }
  }

  static async create(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { name, role, department, clearanceLevel } = req.body;

      if (!name || !role || !department) {
        return res.status(400).json({ success: false, error: 'Champs requis manquants' });
      }

      const staffRef = `s-${Date.now()}`;
      const member = await prisma.staffMember.create({
        data: {
          staffRef,
          name: SanitizeService.text(name),
          role: SanitizeService.text(role),
          department: SanitizeService.text(department),
          clearanceLevel: clearanceLevel || 1,
        },
      });

      res.status(201).json({ success: true, data: member });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erreur création staff' });
    }
  }

  static async updateClearance(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { id } = req.params;
      const { clearanceLevel } = req.body;

      if (!clearanceLevel || clearanceLevel < 1 || clearanceLevel > 5) {
        return res.status(400).json({ success: false, error: 'ClearanceLevel entre 1 et 5 requis' });
      }

      const updated = await prisma.staffMember.update({
        where: { id },
        data: { clearanceLevel, lastAccess: new Date() },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erreur mise à jour clearance' });
    }
  }
}
