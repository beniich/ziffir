// src/server.ts

import { createServer } from 'http';
import { createApp } from './app';
import { initWebSocket } from './websocket/ws.server';
import { PrismaClient } from '@prisma/client';

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
    console.log('✅ Base de données connectée');

    server.listen(PORT, () => {
      console.log(`🚀 Zaphir Backend sur http://localhost:${PORT}`);
      console.log(`📡 WebSocket sur ws://localhost:${PORT}/ws`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Erreur démarrage:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM reçu, fermeture...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

start();
