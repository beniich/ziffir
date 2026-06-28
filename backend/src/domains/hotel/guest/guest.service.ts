import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { encryptPII, decryptPII, hashPII } from '../../../lib/crypto.js';
import { logAudit } from '../../audit/audit.service.js';
import type { Guest } from '@prisma/client';
import type { Request } from 'express';

/**
 * Type de retour: Guest avec PII déchiffrées.
 * Les champs PII (phone, documentNumber) sont en clair.
 */
export type GuestDecrypted = Omit<Guest, 'phone' | 'documentNumber' | 'documentNumberHash'> & {
  phone: string | null;
  documentNumber: string | null;
};

/**
 * Crée un guest avec chiffrement PII automatique.
 */
export async function createGuest(
  hotelId: string,
  data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    nationality?: string;
    documentType?: string;
    documentNumber?: string;
    vip?: boolean;
    preferences?: string;
  },
  req?: Request
): Promise<GuestDecrypted> {
  const encryptedPhone = encryptPII(data.phone);
  const encryptedDoc = encryptPII(data.documentNumber);
  const docHash = hashPII(data.documentNumber);
  
  const guest = await prisma.guest.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: encryptedPhone,
      nationality: data.nationality,
      documentType: data.documentType,
      documentNumber: encryptedDoc,
      documentNumberHash: docHash,
      vip: data.vip ?? false,
      preferences: data.preferences,
      hotelId,
    },
  });
  
  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'guest.created',
    resource: 'guest',
    resourceId: guest.id,
    after: { id: guest.id, firstName: guest.firstName, lastName: guest.lastName },
    metadata: { hotelId },
  }, req);
  
  return decryptGuest(guest);
}

/**
 * Update un guest, en rechiffrant les PII si fournies.
 */
export async function updateGuest(
  id: string,
  hotelId: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    documentType: string;
    documentNumber: string;
    vip: boolean;
    preferences: string;
  }>,
  req?: Request
): Promise<GuestDecrypted> {
  const before = await prisma.guest.findFirst({
    where: { id, hotelId },
  });
  
  if (!before) throw new Error('Guest not found');
  
  const updateData: any = { ...data };
  if (data.phone !== undefined) updateData.phone = encryptPII(data.phone);
  if (data.documentNumber !== undefined) {
    updateData.documentNumber = encryptPII(data.documentNumber);
    updateData.documentNumberHash = hashPII(data.documentNumber);
  }
  
  const after = await prisma.guest.update({
    where: { id },
    data: updateData,
  });
  
  await logAudit({
    actor: req?.user?.userId ?? 'system',
    action: 'guest.updated',
    resource: 'guest',
    resourceId: id,
    before: { id: before.id, firstName: before.firstName, phone: '[REDACTED]' },
    after: { id: after.id, firstName: after.firstName, phone: '[REDACTED]' },
    metadata: { hotelId, changedFields: Object.keys(data) },
  }, req);
  
  return decryptGuest(after);
}

/**
 * Récupère un guest avec déchiffrement automatique.
 */
export async function getGuestDecrypted(id: string, hotelId: string): Promise<GuestDecrypted | null> {
  const guest = await prisma.guest.findFirst({
    where: { id, hotelId },
  });
  return guest ? decryptGuest(guest) : null;
}

/**
 * Liste tous les guests d'un hôtel (déchiffrés).
 * ⚠️ Coûteux pour de grandes listes : déchiffre tout en mémoire.
 * À optimiser avec un système de cache ou projection.
 */
export async function listGuestsDecrypted(
  hotelId: string,
  filters: { search?: string; vip?: boolean; page?: number; pageSize?: number } = {}
) {
  const where: any = { hotelId };
  if (filters.vip !== undefined) where.vip = filters.vip;
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search } },
      { lastName: { contains: filters.search } },
      { email: { contains: filters.search } },
    ];
  }
  
  const [items, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      skip: ((filters.page ?? 1) - 1) * (filters.pageSize ?? 50),
      take: filters.pageSize ?? 50,
    }),
    prisma.guest.count({ where }),
  ]);
  
  return {
    items: items.map(decryptGuest),
    total,
  };
}

/**
 * Recherche par documentNumber (utilise le hash, jamais en clair en DB).
 */
export async function findGuestByDocument(
  hotelId: string,
  documentNumber: string
): Promise<GuestDecrypted | null> {
  const hash = hashPII(documentNumber);
  if (!hash) return null;
  
  const guest = await prisma.guest.findFirst({
    where: { hotelId, documentNumberHash: hash },
  });
  return guest ? decryptGuest(guest) : null;
}

/**
 * Helper interne: déchiffre les PII.
 */
function decryptGuest(g: Guest): GuestDecrypted {
  return {
    ...g,
    phone: g.phone ? decryptPII(g.phone) : null,
    documentNumber: g.documentNumber ? decryptPII(g.documentNumber) : null,
  };
}

/**
 * Helper pour les listes: masque les PII sensibles.
 */
export function maskGuestPII(guest: GuestDecrypted): Partial<GuestDecrypted> {
  return {
    id: guest.id,
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email,
    phone: guest.phone ? `${guest.phone.slice(0, 4)}****` : null,
    vip: guest.vip,
    // documentNumber JAMAIS exposé
  };
}
