"use strict";
// src/controllers/room-service.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomServiceController = void 0;
const client_1 = require("@prisma/client");
const sanitize_service_1 = require("../services/sanitize.service");
const cache_service_1 = require("../services/cache.service");
const ws_server_1 = require("../websocket/ws.server");
const prisma = new client_1.PrismaClient();
const STATUS_FLOW = {
    'Preparation': 'Quality Check',
    'Quality Check': 'Out for Delivery',
    'Out for Delivery': 'Delivered',
    'Delivered': null,
};
const CACHE_KEYS = {
    menu: 'room-service:menu',
    orders: (status) => `room-service:orders:${status || 'all'}`,
};
const CACHE_TTL = {
    menu: 600, // 10 min
    orders: 30, // 30s
};
class RoomServiceController {
    /**
     * GET /api/room-service/menu
     */
    static async getMenu(req, res) {
        try {
            const menu = await cache_service_1.CacheService.remember(CACHE_KEYS.menu, async () => {
                return prisma.course.findMany({
                    where: { available: true },
                    orderBy: { category: 'asc' },
                });
            }, CACHE_TTL.menu);
            res.json({ success: true, data: menu });
        }
        catch (error) {
            console.error('[RoomService.getMenu]', error);
            res.status(500).json({ success: false, error: 'Erreur récupération menu' });
        }
    }
    /**
     * GET /api/room-service/orders
     */
    static async getOrders(req, res) {
        try {
            const status = req.query.status;
            const cacheKey = CACHE_KEYS.orders(status);
            const orders = await cache_service_1.CacheService.remember(cacheKey, async () => {
                return prisma.roomOrder.findMany({
                    where: status ? { status } : undefined,
                    include: { items: true },
                    orderBy: { createdAt: 'desc' },
                });
            }, CACHE_TTL.orders);
            res.json({ success: true, data: orders });
        }
        catch (error) {
            console.error('[RoomService.getOrders]', error);
            res.status(500).json({ success: false, error: 'Erreur récupération commandes' });
        }
    }
    /**
     * POST /api/room-service/orders
     */
    static async createOrder(req, res) {
        try {
            const { roomNumber, guestName, guestVIP, items, notes, priority } = req.body;
            if (!roomNumber || !guestName || !items || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Champs requis: roomNumber, guestName, items[]',
                });
            }
            // Calcul des totaux
            let subtotal = 0;
            const orderItemsData = [];
            for (const item of items) {
                const course = await prisma.course.findUnique({ where: { code: item.courseCode } });
                if (!course) {
                    return res.status(400).json({
                        success: false,
                        error: `Cours inconnu: ${item.courseCode}`,
                    });
                }
                const quantity = item.quantity || 1;
                // Conversion explicite en nombre si c'est un Decimal venant de Postgres
                const coursePrice = Number(course.price);
                const lineTotal = coursePrice * quantity;
                subtotal += lineTotal;
                orderItemsData.push({
                    courseCode: course.code,
                    name: course.name,
                    quantity,
                    price: coursePrice,
                });
            }
            const vat = subtotal * 0.10;
            const serviceCharge = subtotal * 0.10;
            const total = subtotal + vat + serviceCharge;
            // Création
            const orderRef = `order-${Date.now()}`;
            const order = await prisma.roomOrder.create({
                data: {
                    orderRef,
                    roomNumber: sanitize_service_1.SanitizeService.text(roomNumber),
                    guestName: sanitize_service_1.SanitizeService.text(guestName),
                    guestVIP: guestVIP ?? false,
                    status: 'Preparation',
                    priority: priority || 'normal',
                    notes: sanitize_service_1.SanitizeService.textOptional(notes),
                    subtotal,
                    vat,
                    serviceCharge,
                    total,
                    items: {
                        create: orderItemsData,
                    },
                },
                include: { items: true },
            });
            // ⚡ Invalider le cache après mutation
            await cache_service_1.CacheService.delPattern('room-service:orders:*');
            // Notification WebSocket
            (0, ws_server_1.broadcastUpdate)({
                type: 'ORDER_CREATED',
                data: order,
            });
            res.status(201).json({ success: true, data: order });
        }
        catch (error) {
            console.error('[RoomService.createOrder]', error);
            res.status(500).json({ success: false, error: 'Erreur création commande' });
        }
    }
    /**
     * PATCH /api/room-service/orders/:id/advance
     */
    static async advanceOrder(req, res) {
        try {
            const { id } = req.params;
            const order = await prisma.roomOrder.findUnique({ where: { id } });
            if (!order) {
                return res.status(404).json({ success: false, error: 'Commande introuvable' });
            }
            const nextStatus = STATUS_FLOW[order.status];
            if (!nextStatus) {
                return res.status(400).json({ success: false, error: 'Commande déjà livrée' });
            }
            const updated = await prisma.roomOrder.update({
                where: { id },
                data: { status: nextStatus },
                include: { items: true },
            });
            // ⚡ Invalider le cache
            await cache_service_1.CacheService.delPattern('room-service:orders:*');
            (0, ws_server_1.broadcastUpdate)({
                type: 'ORDER_STATUS_CHANGED',
                data: updated,
            });
            res.json({ success: true, data: updated });
        }
        catch (error) {
            console.error('[RoomService.advanceOrder]', error);
            res.status(500).json({ success: false, error: 'Erreur avancement statut' });
        }
    }
}
exports.RoomServiceController = RoomServiceController;
//# sourceMappingURL=room-service.controller.js.map