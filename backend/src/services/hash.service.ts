// src/services/hash.service.ts

import crypto from 'crypto';

/**
 * Service de hachage cryptographique pour les logs d'audit.
 * Implémente une chaîne de hashes (blockchain-like) :
 * chaque log contient le hash du log précédent.
 */
export class HashService {
  private static readonly SALT = process.env.HASH_SALT || 'zaphir-sovereign-salt';

  /**
   * Génère un hash SHA-256 d'une chaîne.
   */
  static sha256(input: string): string {
    return crypto
      .createHash('sha256')
      .update(input + this.SALT)
      .digest('hex');
  }

  /**
   * Calcule le hash d'un audit log en chaînant avec le précédent.
   */
  static computeAuditHash(
    logId: string,
    previousHash: string,
    action: string,
    role: string,
    reason: string
  ): string {
    const payload = `${logId}|${previousHash}|${action}|${role}|${reason}`;
    return this.sha256(payload);
  }

  /**
   * Génère un identifiant de log séquentiel (LOG-001, LOG-002, ...).
   */
  static generateLogId(sequence: number): string {
    return `LOG-${String(sequence).padStart(3, '0')}`;
  }

  /**
   * Vérifie l'intégrité d'une chaîne d'audits.
   */
  static verifyChain(
    audits: Array<{ logId: string; previousHash: string; hash: string; action: string; role: string; reason: string }>
  ): { valid: boolean; brokenAt?: number } {
    for (let i = 0; i < audits.length; i++) {
      const current = audits[i];
      const expectedPreviousHash = i === 0
        ? '0'.repeat(64)
        : audits[i - 1].hash;

      const computedHash = this.computeAuditHash(
        current.logId,
        current.previousHash,
        current.action,
        current.role,
        current.reason
      );

      if (
        current.hash !== computedHash ||
        current.previousHash !== expectedPreviousHash
      ) {
        return { valid: false, brokenAt: i };
      }
    }
    return { valid: true };
  }
}
