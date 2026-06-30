// src/server/domains/shared/services/audit.service.ts
// ============================================================================
// Audit append-only avec hash chain (signature cryptographique SHA-256)
// Chaque log contient le hash du log précédent → chaîne inaltérable
// Compatible SQLite (JSON stocké en String)
// ============================================================================

import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditEventInput {
  eventType: string;
  tenantId?: string | null;
  actorId?: string | null;
  actorType: 'user' | 'super_admin' | 'system' | 'webhook';
  resourceType?: string;
  resourceId?: string;
  action: string;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

class AuditService {
  private isWriting = false;
  private queue: Array<{
    event: AuditEventInput;
    resolve: (log: any) => void;
    reject: (e: any) => void;
  }> = [];

  /**
   * Append un événement au ledger avec hash chain.
   * Les écritures sont sérialisées pour garantir l'intégrité de la chaîne.
   */
  async append(event: AuditEventInput): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ event, resolve, reject });
      this.drain();
    });
  }

  private async drain(): Promise<void> {
    if (this.isWriting || this.queue.length === 0) return;
    this.isWriting = true;

    while (this.queue.length > 0) {
      const { event, resolve, reject } = this.queue.shift()!;
      try {
        const log = await this.writeOne(event);
        resolve(log);
      } catch (e) {
        reject(e);
      }
    }

    this.isWriting = false;
  }

  private async writeOne(event: AuditEventInput) {
    // 1. Récupérer le dernier log (pour la chaîne)
    const last = await prisma.auditLog.findFirst({
      orderBy: { sequence: 'desc' },
      select: { sequence: true, hash: true },
    });

    const sequence = last ? BigInt(last.sequence) + 1n : 1n;
    const previousHash = last?.hash ?? null;
    const now = new Date().toISOString();

    // 2. Calculer le hash du log courant
    const payload = JSON.stringify({
      sequence: sequence.toString(),
      eventType: event.eventType,
      tenantId: event.tenantId ?? null,
      actorId: event.actorId ?? null,
      actorType: event.actorType,
      resourceType: event.resourceType ?? null,
      resourceId: event.resourceId ?? null,
      action: event.action,
      metadata: event.metadata ?? null,
      previousHash,
      createdAt: now,
    });

    const hash = crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex');

    // 3. Écrire
    const log = await prisma.auditLog.create({
      data: {
        sequence,
        eventType: event.eventType,
        tenantId: event.tenantId,
        actorId: event.actorId,
        actorType: event.actorType,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        action: event.action,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        previousHash,
        hash,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      },
    });

    return log;
  }

  /**
   * Vérifie l'intégrité de toute la chaîne (à lancer via cron ou admin)
   */
  async verifyChain(): Promise<{
    valid: boolean;
    brokenAt?: bigint;
    totalLogs: number;
  }> {
    const logs = await prisma.auditLog.findMany({
      orderBy: { sequence: 'asc' },
    });

    let previousHash: string | null = null;

    for (const log of logs) {
      const payload = JSON.stringify({
        sequence: log.sequence.toString(),
        eventType: log.eventType,
        tenantId: log.tenantId,
        actorId: log.actorId,
        actorType: log.actorType,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        action: log.action,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
        previousHash: log.previousHash,
        createdAt: log.createdAt.toISOString(),
      });

      const expectedHash = crypto
        .createHash('sha256')
        .update(payload)
        .digest('hex');

      if (log.hash !== expectedHash || log.previousHash !== previousHash) {
        return {
          valid: false,
          brokenAt: log.sequence,
          totalLogs: logs.length,
        };
      }

      previousHash = log.hash;
    }

    return { valid: true, totalLogs: logs.length };
  }

  /**
   * Récupère les logs d'un tenant avec filtres
   */
  async listForTenant(
    tenantId: string,
    options: {
      eventType?: string;
      resourceType?: string;
      actorId?: string;
      from?: Date;
      to?: Date;
      limit?: number;
    } = {}
  ) {
    const where: any = { tenantId };
    if (options.eventType) where.eventType = options.eventType;
    if (options.resourceType) where.resourceType = options.resourceType;
    if (options.actorId) where.actorId = options.actorId;
    if (options.from || options.to) {
      where.createdAt = {};
      if (options.from) where.createdAt.gte = options.from;
      if (options.to) where.createdAt.lte = options.to;
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { sequence: 'desc' },
      take: options.limit ?? 100,
    });
  }
}

export const auditService = new AuditService();
