"use strict";
// src/services/audit.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const client_1 = require("@prisma/client");
const hash_service_1 = require("./hash.service");
const sanitize_service_1 = require("./sanitize.service");
const prisma = new client_1.PrismaClient();
class AuditService {
    /**
     * Récupère tous les audits (du plus récent au plus ancien).
     */
    static async findAll(limit = 500) {
        return prisma.audit.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }
    /**
     * Crée un nouvel audit avec hash chaîné.
     */
    static async create(input) {
        // Sanitization
        const sanitized = {
            user: sanitize_service_1.SanitizeService.text(input.user),
            role: sanitize_service_1.SanitizeService.text(input.role),
            action: sanitize_service_1.SanitizeService.text(input.action),
            reason: sanitize_service_1.SanitizeService.text(input.reason),
            status: input.status,
        };
        // Récupérer le dernier log pour le chaînage
        const lastAudit = await prisma.audit.findFirst({
            orderBy: { timestamp: 'desc' },
        });
        const previousHash = lastAudit?.hash ?? '0'.repeat(64);
        // Calculer le prochain logId
        const count = await prisma.audit.count();
        const logId = hash_service_1.HashService.generateLogId(count + 1);
        // Calculer le hash
        const hash = hash_service_1.HashService.computeAuditHash(logId, previousHash, sanitized.action, sanitized.role, sanitized.reason);
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
    static async verifyIntegrity() {
        const audits = await prisma.audit.findMany({
            orderBy: { timestamp: 'asc' },
        });
        const result = hash_service_1.HashService.verifyChain(audits.map((a) => ({
            logId: a.logId,
            previousHash: a.previousHash,
            hash: a.hash,
            action: a.action,
            role: a.role,
            reason: a.reason,
        })));
        return { ...result, total: audits.length };
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.service.js.map