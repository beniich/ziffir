"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationController {
    /**
     * POST /api/notifications/register
     * Enregistre un push token pour l'utilisateur
     */
    static async registerToken(req, res) {
        try {
            const ctx = req.user;
            const { pushToken, platform, deviceId } = req.body;
            if (!pushToken) {
                return void res.status(400).json({ success: false, error: 'pushToken requis' });
            }
            // Upsert (1 user peut avoir plusieurs devices)
            await prisma.pushToken.upsert({
                where: { token: pushToken },
                update: {
                    userId: ctx.userId,
                    platform,
                    deviceId,
                    lastUsed: new Date(),
                },
                create: {
                    token: pushToken,
                    userId: ctx.userId,
                    hotelId: ctx.hotelId,
                    platform,
                    deviceId,
                },
            });
            res.json({ success: true });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    /**
     * POST /api/notifications/send
     * Envoie une notification à un user/hôtel (admin uniquement)
     */
    static async send(req, res) {
        try {
            const { userId, hotelId, title, body, data } = req.body;
            const where = { isActive: true };
            if (userId)
                where.userId = userId;
            if (hotelId)
                where.hotelId = hotelId;
            const tokens = await prisma.pushToken.findMany({ where });
            // Envoi via Expo Push API (gratuit, 1M/mois)
            const messages = tokens.map((t) => ({
                to: t.token,
                sound: 'default',
                title,
                body,
                data,
                priority: 'high',
            }));
            const chunks = [];
            for (let i = 0; i < messages.length; i += 100) {
                chunks.push(messages.slice(i, i + 100));
            }
            const results = await Promise.all(chunks.map((chunk) => fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chunk),
            }).then((r) => r.json())));
            res.json({ success: true, sent: messages.length, results });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map