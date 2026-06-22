// src/server.ts

import { createServer } from 'http';
import { createApp } from './app';
import { initWebSocket } from './websocket/ws.server';
import { PrismaClient } from '@prisma/client';
import { closeRedis } from './config/redis';
import { logger } from './utils/logger';

const prisma = new PrismaClient();

const PORT = parseInt(process.env.PORT || '5000');
const app = createApp();
const server = createServer(app);

// Initialiser WebSocket
initWebSocket(server);

// Test connexion DB au démarrage
async function start() {
  try {
    await prisma.$connect();
    logger.info('✅ Base de données connectée');

    server.listen(PORT, () => {
      logger.info(`🚀 Zaphir Backend sur http://localhost:${PORT}`);
      logger.info(`📡 WebSocket sur ws://localhost:${PORT}/ws`);
      logger.info(`🏥 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    logger.error(`❌ Erreur démarrage: ${(err as Error).message || err}`);
    process.exit(1);
  }
}

// ════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ════════════════════════════════════════════════════════════

const shutdown = async (signal: string) => {
  logger.info(`🛑 ${signal} reçu, fermeture en cours...`);

  // 1. Arrêter d'accepter de nouvelles connexions
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // 2. Fermer Prisma
  await prisma.$disconnect();
  logger.info('Prisma disconnected');

  // 3. Fermer Redis
  await closeRedis();
  logger.info('Redis closed');

  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
