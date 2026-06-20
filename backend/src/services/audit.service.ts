// src/services/audit.service.ts

import { PrismaClient, Audit } from '@prisma/client';
import { HashService } from './hash.service';
import { SanitizeService } from './sanitize.service';
import type { AuditStatus } from '../types/index';

const prisma = new PrismaClient();

export interface CreateAuditInput {
  user: string;
  role: string;
  action: string;
  reason: string;
  status: AuditStatus;
}

export class AuditService {
  /**
   * Récupère tous les audits (du plus récent au plus ancien).
   */
  static async findAll(limit: number = 500): Promise<Audit[]> {
    return prisma.audit.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Crée un nouvel audit avec hash chaîné.
   */
  static async create(input: CreateAuditInput): Promise<Audit> {
    // Sanitization
    const sanitized: CreateAuditInput = {
      user: SanitizeService.text(input.user),
      role: SanitizeService.text(input.role),
      action: SanitizeService.text(input.action),
      reason: SanitizeService.text(input.reason),
      status: input.status,
    };

    // Récupérer le dernier log pour le chaînage
    const lastAudit = await prisma.audit.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    const previousHash = lastAudit?.hash ?? '0'.repeat(64);

    // Calculer le prochain logId
    const count = await prisma.audit.count();
    const logId = HashService.generateLogId(count + 1);

    // Calculer le hash
    const hash = HashService.computeAuditHash(
      logId,
      previousHash,
      sanitized.action,
      sanitized.role,
      sanitized.reason
    );

    return prisma.audit.create({
      data: {
        logId,
        user: sanitized.user,
        role: sanitized.role,
        action: sanitized.action,
        reason: sanitized.reason,
        status: sanitized.status,
        previousHash,
        hash,
      },
    });
  }

  /**
   * Vérifie l'intégrité de la chaîne.
   */
  static async verifyIntegrity(): Promise<{ valid: boolean; brokenAt?: number; total: number }> {
    const audits = await prisma.audit.findMany({
      orderBy: { timestamp: 'asc' },
    });

    const result = HashService.verifyChain(
      audits.map((a) => ({
        logId: a.logId,
        previousHash: a.previousHash,
        hash: a.hash,
        action: a.action,
        role: a.role,
        reason: a.reason,
      }))
    );

    return { ...result, total: audits.length };
  }
}
