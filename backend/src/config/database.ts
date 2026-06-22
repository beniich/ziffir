import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'production'
    ? ['error', 'warn']
    : ['query', 'info', 'warn', 'error'],

  // Connection pooling optimisé via DATABASE_URL
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

// 1. Toujours utiliser des transactions pour les opérations critiques
type PrismaTx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export const transaction = async <T>(
  callback: (tx: PrismaTx) => Promise<T>,
): Promise<T> => {
  return prisma.$transaction(callback, {
    maxWait: 5000,  // 5s max wait
    timeout: 10000, // 10s timeout
  });
};

// 2. Helper pour les requêtes avec retry
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries - 1) throw err;
      // Exponential backoff
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 100));
    }
  }
  throw new Error('Max retries reached');
};

// 3. Soft delete helper
export const softDelete = async (model: string, id: string) => {
  return (prisma as any)[model].update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
