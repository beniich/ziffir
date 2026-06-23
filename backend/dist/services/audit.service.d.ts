import { Audit } from '@prisma/client';
import type { AuditStatus } from '../types/index';
export interface CreateAuditInput {
    user: string;
    role: string;
    action: string;
    reason: string;
    status: AuditStatus;
}
export declare class AuditService {
    /**
     * Récupère tous les audits (du plus récent au plus ancien).
     */
    static findAll(limit?: number): Promise<Audit[]>;
    /**
     * Crée un nouvel audit avec hash chaîné.
     */
    static create(input: CreateAuditInput): Promise<Audit>;
    /**
     * Vérifie l'intégrité de la chaîne.
     */
    static verifyIntegrity(): Promise<{
        valid: boolean;
        brokenAt?: number;
        total: number;
    }>;
}
//# sourceMappingURL=audit.service.d.ts.map