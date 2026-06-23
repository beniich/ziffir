"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomOrderController = exports.AppError = void 0;
const client_1 = require("@prisma/client");
const secure_prisma_1 = require("../services/secure-prisma");
const prisma = new client_1.PrismaClient();
// Mocks for logger and cache if missing
const logger = { error: console.error, info: console.log };
const auditLogger = { info: console.log };
const cacheService = { invalidatePattern: async (p) => { } };
const broadcastUpdate = (msg) => { };
class AppError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
class RoomOrderController {
    static async list(req, res) {
        try {
            const ctx = req.user;
            const status = req.query.status;
            const orders = await secure_prisma_1.securePrisma.roomOrder.findMany(ctx, {
                where: status ? { status: status } : undefined,
                include: { items: { include: { course: true } } },
                orderBy: { createdAt: 'desc' },
            });
            res.json({ success: true, data: orders });
        }
        catch (err) {
            logger.error({ err: err.message, userId: req.user?.userId }, 'list orders failed');
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async getById(req, res) {
        try {
            const ctx = req.user;
            const { id } = req.params;
            const order = await secure_prisma_1.securePrisma.roomOrder.findUnique(ctx, id, {
                include: { items: { include: { course: true } } },
            });
            if (!order)
                throw new AppError(404, 'Commande introuvable');
            res.json({ success: true, data: order });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async create(req, res) {
        try {
            const ctx = req.user;
            const { items, ...orderData } = req.body;
            let subtotal = 0;
            const orderItems = [];
            for (const item of items) {
                const course = await prisma.course.findUnique({
                    where: { code: item.courseCode },
                });
                if (!course)
                    throw new AppError(400, `Cours inconnu: ${item.courseCode}`);
                const lineTotal = course.price.toNumber() * item.quantity;
                subtotal += lineTotal;
                orderItems.push({
                    courseCode: course.code,
                    name: course.name,
                    quantity: item.quantity,
                    price: course.price,
                });
            }
            const vat = subtotal * 0.10;
            const serviceCharge = subtotal * 0.10;
            const total = subtotal + vat + serviceCharge;
            const order = await secure_prisma_1.securePrisma.roomOrder.create(ctx, {
                data: {
                    orderRef: `order-${Date.now()}`,
                    ...orderData,
                    subtotal,
                    vat,
                    serviceCharge,
                    total,
                    status: 'PREPARATION',
                    items: {
                        create: orderItems,
                    },
                },
                include: { items: true },
            });
            await cacheService.invalidatePattern('room-orders:*');
            broadcastUpdate({ type: 'ORDER_CREATED', data: order, hotelId: order.hotelId });
            auditLogger.info({ action: 'ORDER_CREATED', orderId: order.id, hotelId: order.hotelId, userId: ctx.userId });
            res.status(201).json({ success: true, data: order });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async advance(req, res) {
        try {
            const ctx = req.user;
            const { id } = req.params;
            const order = await secure_prisma_1.securePrisma.roomOrder.findUnique(ctx, id);
            if (!order)
                throw new AppError(404, 'Commande introuvable');
            const STATUS_FLOW = {
                PREPARATION: 'QUALITY_CHECK',
                QUALITY_CHECK: 'OUT_FOR_DELIVERY',
                OUT_FOR_DELIVERY: 'DELIVERED',
                DELIVERED: null,
            };
            const nextStatus = STATUS_FLOW[order.status];
            if (!nextStatus)
                throw new AppError(400, 'Commande déjà livrée');
            const updated = await secure_prisma_1.securePrisma.roomOrder.update(ctx, id, {
                status: nextStatus,
            });
            await cacheService.invalidatePattern('room-orders:*');
            broadcastUpdate({ type: 'ORDER_STATUS_CHANGED', data: updated, hotelId: updated.hotelId });
            res.json({ success: true, data: updated });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async cancel(req, res) {
        try {
            const ctx = req.user;
            const { id } = req.params;
            const { reason } = req.body;
            if (!reason)
                throw new AppError(400, 'Raison d\'annulation requise');
            const updated = await secure_prisma_1.securePrisma.roomOrder.update(ctx, id, {
                status: 'DELIVERED',
                notes: `[CANCELLED: ${reason}]`,
            });
            await cacheService.invalidatePattern('room-orders:*');
            broadcastUpdate({ type: 'ORDER_CANCELLED', data: { ...updated, cancelReason: reason }, hotelId: updated.hotelId });
            res.json({ success: true, data: updated });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async remove(req, res) {
        try {
            const ctx = req.user;
            const { id } = req.params;
            await secure_prisma_1.securePrisma.roomOrder.delete(ctx, id);
            await cacheService.invalidatePattern('room-orders:*');
            res.json({ success: true, message: 'Commande supprimée' });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.RoomOrderController = RoomOrderController;
//# sourceMappingURL=room-order.controller.js.map