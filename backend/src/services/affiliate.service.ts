/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import { prisma } from '../infrastructure/database/prisma.client.js';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

// ── Gestion des affiliés ──────────────────────────────────────────────────────

export async function createAffiliate(data: {
  email: string;
  firstName: string;
  lastName?: string;
  company?: string;
  payoutMethod?: string;
  password?: string;
}) {
  const code = randomBytes(4).toString('hex').toUpperCase(); // ex: 8F2A1B
  
  let passwordHash = undefined;
  if (data.password) {
    passwordHash = await bcrypt.hash(data.password, 10);
  }

  return prisma.affiliate.create({
    data: {
      email: data.email.toLowerCase(),
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      payoutMethod: data.payoutMethod,
      passwordHash,
      code,
      status: 'PENDING', // Nécessite approbation admin
    },
  });
}

export async function getAffiliateStats(affiliateId: string) {
  const [affiliate, referrals, payouts] = await Promise.all([
    prisma.affiliate.findUniqueOrThrow({ where: { id: affiliateId } }),
    prisma.referral.findMany({ where: { affiliateId } }),
    prisma.affiliatePayout.findMany({ where: { affiliateId } }),
  ]);

  const activeReferrals = referrals.filter(r => r.status === 'ACTIVE').length;
  
  return {
    affiliate,
    stats: {
      clicks: 0, // Idéalement sourcé de PostHog/Google Analytics via UTM
      totalReferrals: referrals.length,
      activeReferrals,
      totalEarned: affiliate.totalEarnedCents,
      pendingPayout: affiliate.pendingPayoutCents,
    },
    recentReferrals: referrals.slice(0, 5),
    recentPayouts: payouts.slice(0, 5),
  };
}

// ── Tracking & Attribution ────────────────────────────────────────────────────

export async function trackClick(code: string, ip?: string, userAgent?: string) {
  const affiliate = await prisma.affiliate.findUnique({ where: { code, status: 'ACTIVE' } });
  if (!affiliate) return null;
  
  // On pourrait logguer un event "affiliate_click" ici
  // Pour l'instant on retourne juste l'affilié pour que le frontend pose le cookie
  return affiliate;
}

export async function attributeReferral(hotelId: string, code: string, source: string) {
  const affiliate = await prisma.affiliate.findUnique({ where: { code, status: 'ACTIVE' } });
  if (!affiliate) return null;

  const existing = await prisma.referral.findUnique({ where: { referredHotelId: hotelId } });
  if (existing) return existing;

  const referral = await prisma.referral.create({
    data: {
      affiliateId: affiliate.id,
      referredHotelId: hotelId,
      source,
      status: 'PENDING', // Deviendra ACTIVE quand l'hôtel paiera son abonnement
    },
  });

  await prisma.affiliate.update({
    where: { id: affiliate.id },
    data: { lifetimeReferrals: { increment: 1 } },
  });

  return referral;
}

// ── Commissions ────────────────────────────────────────────────────────────────

export async function computeCommissions(hotelId: string, subscriptionAmountCents: number) {
  const referral = await prisma.referral.findUnique({
    where: { referredHotelId: hotelId },
    include: { affiliate: true },
  });

  if (!referral || referral.affiliate.status !== 'ACTIVE') return;

  const commission = Math.round(subscriptionAmountCents * referral.affiliate.commission);

  // Mettre à jour le statut du referral
  if (referral.status === 'PENDING') {
    await prisma.referral.update({
      where: { id: referral.id },
      data: { status: 'ACTIVE', convertedAt: new Date() },
    });
  }

  // Ajouter la commission
  await prisma.$transaction([
    prisma.referral.update({
      where: { id: referral.id },
      data: {
        totalCommissionCents: { increment: commission },
        monthsActive: { increment: 1 },
      },
    }),
    prisma.affiliate.update({
      where: { id: referral.affiliate.id },
      data: {
        totalEarnedCents: { increment: commission },
        pendingPayoutCents: { increment: commission },
      },
    }),
  ]);
}
