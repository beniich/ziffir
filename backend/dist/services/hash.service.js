"use strict";
// src/services/hash.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashService = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Service de hachage cryptographique pour les logs d'audit.
 * Implémente une chaîne de hashes (blockchain-like) :
 * chaque log contient le hash du log précédent.
 */
class HashService {
    static SALT = process.env.HASH_SALT || 'zaphir-sovereign-salt';
    /**
     * Génère un hash SHA-256 d'une chaîne.
     */
    static sha256(input) {
        return crypto_1.default
            .createHash('sha256')
            .update(input + this.SALT)
            .digest('hex');
    }
    /**
     * Calcule le hash d'un audit log en chaînant avec le précédent.
     */
    static computeAuditHash(logId, previousHash, action, role, reason) {
        const payload = `${logId}|${previousHash}|${action}|${role}|${reason}`;
        return this.sha256(payload);
    }
    /**
     * Génère un identifiant de log séquentiel (LOG-001, LOG-002, ...).
     */
    static generateLogId(sequence) {
        return `LOG-${String(sequence).padStart(3, '0')}`;
    }
    /**
     * Vérifie l'intégrité d'une chaîne d'audits.
     */
    static verifyChain(audits) {
        for (let i = 0; i < audits.length; i++) {
            const current = audits[i];
            const expectedPreviousHash = i === 0
                ? '0'.repeat(64)
                : audits[i - 1].hash;
            const computedHash = this.computeAuditHash(current.logId, current.previousHash, current.action, current.role, current.reason);
            if (current.hash !== computedHash ||
                current.previousHash !== expectedPreviousHash) {
                return { valid: false, brokenAt: i };
            }
        }
        return { valid: true };
    }
}
exports.HashService = HashService;
//# sourceMappingURL=hash.service.js.map