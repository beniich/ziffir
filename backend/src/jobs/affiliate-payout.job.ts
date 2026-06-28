import cron from 'node-cron';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

export function setupAffiliatePayoutJob() {
  // Le 1er du mois à 2h du matin
  cron.schedule('0 2 1 * *', async () => {
    console.log('💰 Generating affiliate payouts...');
    
    const previousMonthStart = startOfMonth(subMonths(new Date(), 1));
    const previousMonthEnd = endOfMonth(subMonths(new Date(), 1));

    try {
      // Trouver tous les affiliés ayant des commissions en attente (ex: > 50€ = 5000 cents)
      const thresholdCents = 5000;
      const affiliates = await prisma.affiliate.findMany({
        where: {
          status: 'ACTIVE',
          pendingPayoutCents: { gte: thresholdCents },
        },
      });

      console.log(`Found ${affiliates.length} affiliates eligible for payout.`);

      for (const aff of affiliates) {
        const amountCents = aff.pendingPayoutCents;
        
        await prisma.$transaction(async (tx) => {
          // Créer le payout record
          await tx.affiliatePayout.create({
            data: {
              affiliateId: aff.id,
              amountCents,
              periodStart: previousMonthStart,
              periodEnd: previousMonthEnd,
              status: 'PENDING', // Un admin validera et déclenchera le paiement Stripe Connect
            },
          });

          // Réinitialiser le pending
          await tx.affiliate.update({
            where: { id: aff.id },
            data: { pendingPayoutCents: 0 },
          });
        });
        
        console.log(`Generated payout of ${amountCents / 100}€ for affiliate ${aff.email}`);
      }
    } catch (e) {
      console.error('Affiliate payout job failed:', e);
    }
  });
}
