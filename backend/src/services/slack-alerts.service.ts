import cron from 'node-cron';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { env } from '../config/env.js';

// ─── Helper bas niveau ──────────────────────────────────────────────────────

async function postToSlack(text: string, blocks?: object[]) {
  if (!env.SLACK_ALERT_WEBHOOK_URL) {
    console.warn('[SLACK ALERT]', text);
    return;
  }
  try {
    const body: Record<string, unknown> = { text };
    if (blocks) body.blocks = blocks;
    await fetch(env.SLACK_ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error('[SLACK ALERT] Erreur d\'envoi:', e);
  }
}

// ─── Alertes ponctuelles (appelées sur événements) ──────────────────────────

/**
 * Alerte quand un nouveau client paye pour la première fois.
 */
export async function alertNewPayingCustomer(hotelName: string, plan: string, mrrCents: number) {
  await postToSlack(`💰 *Nouveau client payant !*`, [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `💰 *Nouveau client payant !*\n*Hôtel :* ${hotelName}\n*Plan :* ${plan.toUpperCase()}\n*MRR ajouté :* ${(mrrCents / 100).toFixed(2)} €`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Voir le client →' },
          url: `${env.APP_URL}/admin/leads`,
        },
      ],
    },
  ]);
}

/**
 * Alerte sur chaque paiement échoué (Stripe webhook).
 */
export async function alertPaymentFailed(hotelName: string, amountCents: number, reason: string) {
  await postToSlack(`⚠️ Paiement échoué`, [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `⚠️ *Paiement échoué*\n*Hôtel :* ${hotelName}\n*Montant :* ${(amountCents / 100).toFixed(2)} €\n*Raison :* ${reason}`,
      },
    },
  ]);
}

/**
 * Alerte quand un client annule son abonnement.
 */
export async function alertChurn(hotelName: string, plan: string, mrrLostCents: number) {
  await postToSlack(`🔴 Churn détecté`, [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🔴 *Churn détecté*\n*Hôtel :* ${hotelName}\n*Plan annulé :* ${plan.toUpperCase()}\n*MRR perdu :* ${(mrrLostCents / 100).toFixed(2)} €`,
      },
    },
  ]);
}

/**
 * Alerte sur chaque nouveau lead capturé depuis le site marketing.
 */
export async function alertNewLead(name: string, email: string, company: string, source: string) {
  await postToSlack(`🎯 Nouveau lead`, [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🎯 *Nouveau lead*\n*Nom :* ${name}\n*Email :* ${email}\n*Hôtel :* ${company}\n*Source :* ${source}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Voir dans le CRM →' },
          url: `${env.APP_URL}/admin/leads`,
        },
      ],
    },
  ]);
}

// ─── Monitoring périodique (cron) ──────────────────────────────────────────

export function startSlackAlerts() {
  // Monitoring quotidien à 8h00 (résumé du jour)
  cron.schedule('0 8 * * *', async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        newLeads,
        newSubs,
        cancelledSubs,
        activeSubs,
        failedPayments,
      ] = await Promise.all([
        prisma.lead.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
        prisma.subscription.count({ where: { createdAt: { gte: yesterday, lt: today }, status: 'active' } }),
        prisma.subscription.count({ where: { canceledAt: { gte: yesterday, lt: today } } }),
        prisma.subscription.findMany({ where: { status: 'active' } }),
        prisma.payment.count({ where: { createdAt: { gte: yesterday, lt: today }, status: 'FAILED' } }),
      ]);

      // Calcul du MRR en local (même logique que metrics.service.ts)
      const PLAN_PRICES: Record<string, Record<string, number>> = {
        starter: { monthly: 9900, yearly: 94880 },
        pro: { monthly: 24900, yearly: 238800 },
        enterprise: { monthly: 79900, yearly: 778800 },
      };

      const mrrCents = activeSubs.reduce((total, sub) => {
        const price = PLAN_PRICES[sub.plan]?.[sub.interval] ?? 0;
        return total + (sub.interval === 'yearly' ? Math.round(price / 12) : price);
      }, 0);

      await postToSlack(`📊 Rapport journalier Sapphire`, [
        {
          type: 'header',
          text: { type: 'plain_text', text: `📊 Rapport journalier — ${new Date().toLocaleDateString('fr-FR')}` },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*MRR actuel*\n${(mrrCents / 100).toFixed(2)} €` },
            { type: 'mrkdwn', text: `*Clients actifs*\n${activeSubs.length}` },
            { type: 'mrkdwn', text: `*Nouveaux leads (hier)*\n${newLeads}` },
            { type: 'mrkdwn', text: `*Nouveaux abonnés (hier)*\n${newSubs}` },
            { type: 'mrkdwn', text: `*Churns (hier)*\n${cancelledSubs}` },
            { type: 'mrkdwn', text: `*Paiements échoués (hier)*\n${failedPayments}` },
          ],
        },
      ]);

      // Alertes critiques
      if (failedPayments >= 3) {
        await postToSlack(`🚨 ALERTE : ${failedPayments} paiements échoués hier ! Vérifier Stripe.`);
      }

      if (cancelledSubs > newSubs) {
        await postToSlack(`⚠️ ALERTE CHURN : Plus de cancellations (${cancelledSubs}) que de nouveaux abonnés (${newSubs}) hier.`);
      }

      console.log('[SLACK ALERTS] Rapport journalier envoyé');
    } catch (e) {
      console.error('[SLACK ALERTS] Erreur:', e);
    }
  }, { timezone: 'Europe/Paris' });

  console.log('[SLACK ALERTS] Monitoring planifié à 8h00 (Europe/Paris)');
}
