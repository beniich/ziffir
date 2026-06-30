// src/server/services/push-notification.service.ts
// ============================================================================
// Push notifications Web (PWA) via web-push
// Gère l'envoi + nettoyage des subscriptions expirées
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

class PushNotificationService {
  private webpush: any = null;

  private async getWebpush() {
    if (this.webpush) return this.webpush;
    try {
      // Chargement dynamique pour éviter l'erreur si web-push n'est pas installé
      this.webpush = await import('web-push');
      const vapidEmail = process.env.VAPID_EMAIL || 'admin@zaphir.io';
      const vapidPublic = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

      if (vapidPublic && vapidPrivate) {
        this.webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate);
      } else {
        console.warn('[push] VAPID keys not configured — push disabled');
      }
    } catch (e) {
      console.warn('[push] web-push not installed — push notifications disabled');
    }
    return this.webpush;
  }

  /** Envoie une notification à tous les appareils d'un user */
  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });
    if (subscriptions.length === 0) return;

    await this.sendToSubscriptions(subscriptions, payload);
  }

  /** Envoie à une liste d'endpoints */
  async sendToMany(endpoints: string[], payload: PushPayload): Promise<void> {
    if (endpoints.length === 0) return;
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { endpoint: { in: endpoints } },
    });
    await this.sendToSubscriptions(subscriptions, payload);
  }

  private async sendToSubscriptions(subscriptions: any[], payload: PushPayload): Promise<void> {
    const wp = await this.getWebpush();
    if (!wp || !process.env.VAPID_PUBLIC_KEY) return; // Dégradé gracieusement

    const notification = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/badge-72.png',
      tag: payload.tag,
      data: { url: payload.url, ...payload.data },
    });

    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        wp.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notification
        ).catch(async (err: any) => {
          // Subscription expirée → nettoyage
          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          }
          throw err;
        })
      )
    );

    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed > 0) {
      console.warn(`[push] ${failed}/${results.length} notifications failed`);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
