import cron from 'node-cron';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { onboardingEmails, type OnboardingContext } from '../services/onboarding-emails.service.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysSince(date: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

async function buildCtxFromHotel(hotelId: string): Promise<OnboardingContext | null> {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: { users: { where: { role: 'ADMIN' }, take: 1 } },
  });
  if (!hotel || hotel.users.length === 0) return null;

  const admin = hotel.users[0];
  return {
    adminName: `${admin.firstName} ${admin.lastName}`,
    adminEmail: admin.email,
    hotelName: hotel.name,
    hotelCity: hotel.city,
    appUrl: process.env.APP_URL ?? 'https://app.sapphire.luxury',
  };
}

// ─── Job principal : séquence de nurturing ────────────────────────────────────

export function startOnboardingJob() {
  // S'exécute chaque matin à 9h00
  cron.schedule('0 9 * * *', async () => {
    console.log('[ONBOARDING JOB] Vérification des séquences...');

    try {
      // Cherche tous les hôtels avec une subscription active ou en trial
      const subscriptions = await prisma.subscription.findMany({
        where: { status: { in: ['active', 'trialing'] } },
      });

      for (const sub of subscriptions) {
        const ctx = await buildCtxFromHotel(sub.hotelId);
        if (!ctx) continue;

        const days = daysSince(sub.createdAt);

        // Séquence : on déclenche l'email du bon jour
        try {
          if (days === 2) {
            await onboardingEmails.sendFirstStepsEmail(ctx);
            console.log(`[ONBOARDING J2] → ${ctx.adminEmail}`);
          } else if (days === 5) {
            await onboardingEmails.sendChannelManagerEmail(ctx);
            console.log(`[ONBOARDING J5] → ${ctx.adminEmail}`);
          } else if (days === 12 && sub.status === 'trialing') {
            await onboardingEmails.sendTrialEndingEmail(ctx);
            console.log(`[ONBOARDING J12 TRIAL] → ${ctx.adminEmail}`);
          } else if (days === 14) {
            await onboardingEmails.sendTwoWeekCheckinEmail(ctx);
            console.log(`[ONBOARDING J14] → ${ctx.adminEmail}`);
          } else if (days === 21) {
            await onboardingEmails.sendAdvancedTipsEmail(ctx);
            console.log(`[ONBOARDING J21] → ${ctx.adminEmail}`);
          } else if (days === 30) {
            await onboardingEmails.sendOneMonthReviewEmail(ctx);
            console.log(`[ONBOARDING J30] → ${ctx.adminEmail}`);
          }
        } catch (emailErr) {
          console.error(`[ONBOARDING] Erreur email pour ${ctx.adminEmail}:`, emailErr);
        }
      }

      // Win-back : hôtels dont la sub vient d'être annulée (il y a 0-1 jour)
      const cancelledSubs = await prisma.subscription.findMany({
        where: {
          status: 'canceled',
          canceledAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // dernières 24h
          },
        },
      });

      for (const sub of cancelledSubs) {
        const ctx = await buildCtxFromHotel(sub.hotelId);
        if (!ctx) continue;
        try {
          await onboardingEmails.sendWinBackEmail(ctx);
          console.log(`[ONBOARDING WIN-BACK] → ${ctx.adminEmail}`);
        } catch (e) {
          console.error(`[ONBOARDING] Win-back error:`, e);
        }
      }

      console.log('[ONBOARDING JOB] ✅ Terminé');
    } catch (err) {
      console.error('[ONBOARDING JOB] ❌ Erreur critique:', err);
    }
  }, { timezone: 'Europe/Paris' });

  console.log('[ONBOARDING JOB] Planifié à 9h00 (Europe/Paris)');
}
