"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const secure_prisma_1 = require("../services/secure-prisma");
// Note: Requires date-fns, if not installed run: npm install date-fns
const date_fns_1 = require("date-fns");
const cacheService = {
    invalidatePattern: async (p) => { },
    remember: async (key, fn, ttl) => fn()
};
class AnalyticsController {
    static async overview(req, res) {
        try {
            const ctx = req.user;
            const days = parseInt(req.query.days) || 7;
            const cacheKey = `analytics:overview:${ctx.hotelId}:${days}`;
            const kpis = await cacheService.remember(cacheKey, async () => {
                const since = (0, date_fns_1.subDays)(new Date(), days);
                const orders = await secure_prisma_1.securePrisma.roomOrder.findMany(ctx, {
                    where: { createdAt: { gte: since } },
                    select: { total: true, status: true, createdAt: true },
                });
                const activeStaff = await secure_prisma_1.securePrisma.staff.count(ctx, {
                    where: { active: true },
                });
                const rooms = await secure_prisma_1.securePrisma.room.findMany(ctx, {
                    where: { status: 'OCCUPIED' },
                    select: { id: true },
                });
                const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
                const completedOrders = orders.filter((o) => o.status === 'DELIVERED').length;
                const totalRooms = await secure_prisma_1.securePrisma.room.count(ctx);
                const occupancyRate = totalRooms > 0 ? (rooms.length / totalRooms) * 100 : 0;
                return {
                    period: { days, since: since.toISOString() },
                    orders: {
                        total: orders.length,
                        completed: completedOrders,
                        pending: orders.length - completedOrders,
                    },
                    revenue: {
                        total: totalRevenue,
                        average: orders.length > 0 ? totalRevenue / orders.length : 0,
                    },
                    occupancy: {
                        occupied: rooms.length,
                        total: totalRooms,
                        rate: Math.round(occupancyRate * 100) / 100,
                    },
                    staff: {
                        active: activeStaff,
                    },
                };
            }, 300);
            res.json({ success: true, data: kpis });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async revenueByDay(req, res) {
        try {
            const ctx = req.user;
            const days = parseInt(req.query.days) || 30;
            const cacheKey = `analytics:revenue:${ctx.hotelId}:${days}`;
            const data = await cacheService.remember(cacheKey, async () => {
                const orders = await secure_prisma_1.securePrisma.roomOrder.findMany(ctx, {
                    where: {
                        createdAt: { gte: (0, date_fns_1.subDays)(new Date(), days) },
                        status: 'DELIVERED',
                    },
                    select: { total: true, createdAt: true },
                });
                const byDay = {};
                for (let i = 0; i < days; i++) {
                    const d = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(new Date(), i));
                    byDay[d.toISOString().split('T')[0]] = 0;
                }
                for (const order of orders) {
                    const day = (0, date_fns_1.startOfDay)(order.createdAt).toISOString().split('T')[0];
                    if (byDay[day] !== undefined) {
                        byDay[day] += Number(order.total);
                    }
                }
                return Object.entries(byDay).map(([date, revenue]) => ({
                    date,
                    revenue,
                })).sort((a, b) => a.date.localeCompare(b.date));
            }, 300);
            res.json({ success: true, data });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map