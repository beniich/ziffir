import cron from 'node-cron';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Tâche CRON quotidienne à 02:00 :
 * - Marque les trials expirés comme CANCELED
 * - Nettoyage usage_records vieux de 13 mois (RGPD-like)
 */
cron.schedule('0 2 * * *', async () => {
  logger.info('Running billing cleanup job');

  try {
    // Trials expirés
    const expiredTrials = await prisma.subscription.updateMany({
      where: {
        status: 'TRIALING',
        trialEndsAt: { lt: new Date() },
      },
      data: { status: 'CANCELED' },
    });

    logger.info(`Expired trials canceled: count=${expiredTrials.count}`);

    // Nettoyage usage_records vieux de 13 mois
    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

    const oldUsage = await prisma.usageRecord.deleteMany({
      where: { period: { lt: thirteenMonthsAgo } },
    });

    logger.info(`Old usage records deleted: count=${oldUsage.count}`);
  } catch (error: any) {
    logger.error(`Billing cleanup job failed: ${error.message}`);
  }
});
