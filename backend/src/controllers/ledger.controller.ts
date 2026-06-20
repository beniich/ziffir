// src/controllers/ledger.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { HashService } from '../services/hash.service';
import { SanitizeService } from '../services/sanitize.service';
import type { ApiResponse } from '../types';

const prisma = new PrismaClient();

export class LedgerController {
  /**
   * GET /api/ledger/courses
   */
  static async getCourses(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const courses = await prisma.ledgerCourse.findMany({
        orderBy: { completedDate: 'asc' },
      });

      // Calcul du GPA
      const gradePoints: Record<string, number> = {
        'A+': 4.3, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D': 1.0, 'F': 0,
      };

      let totalPoints = 0;
      let totalCredits = 0;
      for (const c of courses) {
        const points = gradePoints[c.grade] ?? 0;
        totalPoints += points * c.credits;
        totalCredits += c.credits;
      }
      const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

      res.json({
        success: true,
        data: { courses, gpa, totalCredits },
      });
    } catch (error) {
      console.error('[Ledger.getCourses]', error);
      res.status(500).json({ success: false, error: 'Erreur récupération ledger' });
    }
  }

  /**
   * POST /api/ledger/courses
   */
  static async createCourse(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { code, name, category, credits, grade, completedDate } = req.body;

      if (!code || !name || !category || !credits || !grade || !completedDate) {
        return res.status(400).json({ success: false, error: 'Champs requis manquants' });
      }

      // Hash blockchain du cours
      const blockchainHash = HashService.sha256(`${code}|${name}|${credits}|${grade}`);

      const course = await prisma.ledgerCourse.create({
        data: {
          code: SanitizeService.text(code),
          name: SanitizeService.text(name),
          category: SanitizeService.text(category),
          credits: parseFloat(credits),
          grade: SanitizeService.text(grade),
          completedDate: SanitizeService.text(completedDate),
          blockchainHash,
        },
      });

      res.status(201).json({ success: true, data: course });
    } catch (error) {
      console.error('[Ledger.createCourse]', error);
      res.status(500).json({ success: false, error: 'Erreur création cours' });
    }
  }
}
