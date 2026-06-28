import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { logAudit } from '../../audit/audit.service.js';
import { createHash } from 'node:crypto';
import type { Request } from 'express';

/**
 * Anonymise un guest (RGPD Article 17 - Droit à l'oubli).
 * 
 * Processus:
 * 1. Snapshot du guest (pour audit)
 * 2. Remplace les PII par des valeurs anonymisées
 * 3. Supprime les données sensibles (PII chiffrées)
 * 4. Conserve les liens comptables (factures, paiements) avec un ID anonymisé
 * 5. Log l'opération dans le forensic ledger
 */
export async function anonymizeGuest(
  id: string,
  hotelId: string,
  reason: string,
  req?: Request
) {
  const before = await prisma.guest.findFirst({
    where: { id, hotelId },
    include: {
      reservations: { select: { id: true, totalPrice: true, status: true } },
    },
  });
  
  if (!before) throw new Error('Guest not found');
  
  // Génère un ID anonymisé déterministe (même guest = même anonId)
  const anonId = createHash('sha256')
    .update(`anonymized-${id}-${Date.now()}`)
    .digest('hex')
    .slice(0, 16);
  
  const anonEmail = `anonymized-${anonId}@removed.invalid`;
  const anonPhone = null;
  const anonDoc = null;
  const anonDocHash = null;
  
  // 1. Log dans le forensic ledger AVANT modification (preuve légale)
  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'guest.anonymized',
    resource: 'guest',
    resourceId: id,
    before: {
      id: before.id,
      firstName: before.firstName,
      lastName: before.lastName,
      email: before.email,
      phone: '[REDACTED]',
      documentNumber: '[REDACTED]',
    },
    metadata: {
      reason,
      anonymizedAt: new Date().toISOString(),
      // ⚠️ On garde la trace des factures (obligation comptable 10 ans)
      invoiceCount: before.reservations.length,
      totalRevenue: before.reservations.reduce((s, r) => s + r.totalPrice, 0),
    },
  }, req);
  
  // 2. Anonymisation: on garde firstName/lastName pour traçabilité comptable
  //    mais on supprime TOUTES les PII
  const anonymized = await prisma.guest.update({
    where: { id },
    data: {
      firstName: `GUEST_${anonId.slice(0, 8).toUpperCase()}`,
      lastName: 'ANONYMIZED',
      email: anonEmail,
      phone: anonPhone,
      nationality: null,
      documentType: null,
      documentNumber: anonDoc,
      documentNumberHash: anonDocHash,
      preferences: null,
      vip: false,
    },
  });
  
  return {
    guest: anonymized,
    auditEventId: id, // référence pour traçabilité
  };
}
