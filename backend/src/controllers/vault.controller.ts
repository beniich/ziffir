// src/controllers/vault.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SanitizeService } from '../services/sanitize.service';
import { broadcastUpdate } from '../websocket/ws.server';
import type { ApiResponse } from '../types';

const prisma = new PrismaClient();

export class VaultController {
  static async getDocuments(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const docs = await prisma.vaultDocument.findMany({
        where: { withdrawnAt: null },
        orderBy: { depositDate: 'desc' },
      });
      res.json({ success: true, data: docs });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erreur récupération documents' });
    }
  }

  static async addDocument(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { name, category, owner, room, fingerprint } = req.body;

      if (!name || !category || !owner || !room) {
        return res.status(400).json({ success: false, error: 'Champs requis manquants' });
      }

      const docRef = `doc-${Date.now()}`;
      const doc = await prisma.vaultDocument.create({
        data: {
          docRef,
          name: SanitizeService.text(name),
          category: SanitizeService.text(category),
          owner: SanitizeService.text(owner),
          room: SanitizeService.text(room),
          fingerprint: fingerprint ?? true,
        },
      });

      broadcastUpdate({ type: 'VAULT_DOC_ADDED', data: doc });
      res.status(201).json({ success: true, data: doc });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erreur ajout document' });
    }
  }

  static async withdrawDocument(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { id } = req.params;
      const updated = await prisma.vaultDocument.update({
        where: { id },
        data: { withdrawnAt: new Date() },
      });

      broadcastUpdate({ type: 'VAULT_DOC_WITHDRAWN', data: updated });
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erreur retrait document' });
    }
  }
}
