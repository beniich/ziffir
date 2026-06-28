import { prisma } from '../database/prisma.client.js';
import crypto from 'crypto';

/**
 * Service pour dispatcher les webhooks sortants (Outbound Webhooks).
 * Utilisé par l'API pour notifier les hôtels des événements (ex: reservation.created).
 */

export async function queueWebhook(hotelId: string, event: string, payload: any) {
  // Trouver tous les endpoints de cet hôtel abonnés à cet event
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { hotelId, status: 'ACTIVE' },
  });

  const matchingEndpoints = endpoints.filter((ep) =>
    ep.events.split(',').includes(event) || ep.events.includes('*')
  );

  if (matchingEndpoints.length === 0) return;

  // Créer un log pour chaque endpoint (statut PENDING implicite via tentatives)
  const logs = await Promise.all(
    matchingEndpoints.map((ep) =>
      prisma.webhookLog.create({
        data: {
          webhookId: ep.id,
          event,
          payload: JSON.stringify(payload),
          status: 'PENDING',
        },
      })
    )
  );

  // Dispatch asynchrone (pas besoin d'attendre la réponse HTTP pour rendre la main à l'API)
  for (let i = 0; i < matchingEndpoints.length; i++) {
    dispatchWebhook(matchingEndpoints[i], logs[i], payload).catch((err) =>
      console.error(`Webhook dispatch error for log ${logs[i].id}:`, err)
    );
  }
}

async function dispatchWebhook(endpoint: any, log: any, payload: any) {
  const payloadString = JSON.stringify(payload);
  const timestamp = Date.now().toString();
  
  // Signature HMAC
  // format: t=<timestamp>,v1=<signature>
  const signature = crypto
    .createHmac('sha256', endpoint.secret)
    .update(`${timestamp}.${payloadString}`)
    .digest('hex');

  const signatureHeader = `t=${timestamp},v1=${signature}`;

  try {
    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': signatureHeader, // Convention Stripe-like
        'Sapphire-Signature': signatureHeader,
        'Sapphire-Event': log.event,
      },
      body: payloadString,
      // Timeout de 5s pour éviter de bloquer
      signal: AbortSignal.timeout(5000),
    });

    await prisma.webhookLog.update({
      where: { id: log.id },
      data: {
        status: res.ok ? 'SUCCESS' : 'FAILED',
        responseCode: res.status,
        sentAt: new Date(),
      },
    });
  } catch (err: any) {
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: {
        status: 'FAILED',
        errorMessage: err.message,
        sentAt: new Date(),
      },
    });
    
    // Retry logic simple : on pourrait utiliser une file BullMQ pour de vrais retries exponentiels.
  }
}
