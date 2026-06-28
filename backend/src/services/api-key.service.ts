import { prisma } from '../infrastructure/database/prisma.client.js';
import crypto from 'crypto';

export async function createApiKey(hotelId: string, name: string, scopes: string[]) {
  // Générer une clé lisible une seule fois (ex: sph_live_xxxx)
  const rawKey = `sph_live_${crypto.randomBytes(24).toString('hex')}`;
  
  // Hasher la clé pour la base de données (sécurité en cas de leak)
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const prefix = rawKey.substring(0, 13); // "sph_live_xxxx"

  const apiKey = await prisma.apiKey.create({
    data: {
      hotelId,
      name,
      keyHash,
      prefix,
      scopes: scopes.join(','),
      status: 'ACTIVE',
    },
  });

  return { apiKey, rawKey }; // On retourne la clé en clair *une seule fois*
}

export async function revokeApiKey(id: string, hotelId: string) {
  return prisma.apiKey.update({
    where: { id, hotelId },
    data: { status: 'REVOKED' },
  });
}

export async function validateApiKey(rawKey: string) {
  if (!rawKey.startsWith('sph_live_')) return null;

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { hotel: true },
  });

  if (!apiKey || apiKey.status !== 'ACTIVE') return null;

  // Optionnel: vérifier expiresAt
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    await prisma.apiKey.update({ where: { id: apiKey.id }, data: { status: 'REVOKED' } });
    return null;
  }

  // Mettre à jour lastUsedAt de manière asynchrone pour ne pas ralentir
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return apiKey;
}
