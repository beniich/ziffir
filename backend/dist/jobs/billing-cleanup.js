"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
/**
 * Tâche CRON quotidienne à 02:00 :
 * - Marque les trials expirés comme CANCELED
 * - Nettoyage usage_records vieux de 13 mois (RGPD-like)
 */
node_cron_1.default.schedule('0 2 * * *', async () => {
    logger_1.logger.info('Running billing cleanup job');
    try {
        // Trials expirés
        const expiredTrials = await database_1.prisma.subscription.updateMany({
            where: {
                status: 'TRIALING',
                trialEndsAt: { lt: new Date() },
            },
            data: { status: 'CANCELED' },
        });
        logger_1.logger.info(`Expired trials canceled: count=${expiredTrials.count}`);
        // Nettoyage usage_records vieux de 13 mois
        const thirteenMonthsAgo = new Date();
        thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);
        const oldUsage = await database_1.prisma.usageRecord.deleteMany({
            where: { period: { lt: thirteenMonthsAgo } },
        });
        logger_1.logger.info(`Old usage records deleted: count=${oldUsage.count}`);
    }
    catch (error) {
        logger_1.logger.error(`Billing cleanup job failed: ${error.message}`);
    }
});
//# sourceMappingURL=billing-cleanup.js.map