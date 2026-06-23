"use strict";
// src/server.ts
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./app");
const ws_server_1 = require("./websocket/ws.server");
const client_1 = require("@prisma/client");
const redis_1 = require("./config/redis");
const logger_1 = require("./utils/logger");
const prisma = new client_1.PrismaClient();
const PORT = parseInt(process.env.PORT || '5000');
const app = (0, app_1.createApp)();
const server = (0, http_1.createServer)(app);
// Initialiser WebSocket
(0, ws_server_1.initWebSocket)(server);
// Test connexion DB au démarrage
async function start() {
    try {
        await prisma.$connect();
        logger_1.logger.info('✅ Base de données connectée');
        server.listen(PORT, () => {
            logger_1.logger.info(`🚀 Zaphir Backend sur http://localhost:${PORT}`);
            logger_1.logger.info(`📡 WebSocket sur ws://localhost:${PORT}/ws`);
            logger_1.logger.info(`🏥 Health: http://localhost:${PORT}/api/health`);
        });
    }
    catch (err) {
        logger_1.logger.error(`❌ Erreur démarrage: ${err.message || err}`);
        process.exit(1);
    }
}
// ════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ════════════════════════════════════════════════════════════
const shutdown = async (signal) => {
    logger_1.logger.info(`🛑 ${signal} reçu, fermeture en cours...`);
    // 1. Arrêter d'accepter de nouvelles connexions
    server.close(() => {
        logger_1.logger.info('HTTP server closed');
    });
    // 2. Fermer Prisma
    await prisma.$disconnect();
    logger_1.logger.info('Prisma disconnected');
    // 3. Fermer Redis
    await (0, redis_1.closeRedis)();
    logger_1.logger.info('Redis closed');
    process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
start();
//# sourceMappingURL=server.js.map