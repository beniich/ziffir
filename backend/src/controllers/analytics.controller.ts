import { Request, Response } from 'express';
import { securePrisma } from '../services/secure-prisma';
// import { cacheService } from '../services/cache.service';
import { AppError } from '../middleware/errorHandler';
import { UserContext } from '../services/permissions.service';
// Note: Requires date-fns, if not installed run: npm install date-fns
import { subDays, startOfDay, endOfDay } from 'date-fns';

const cacheService = { 
  invalidatePattern: async (p: string) => {},
  remember: async (key: string, fn: Function, ttl: number) => fn()
};

export class AnalyticsController {
  static async overview(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const days = parseInt(req.query.days as string) || 7;
      const cacheKey = `analytics:overview:${ctx.hotelId}:${days}`;

      const kpis = await cacheService.remember(
        cacheKey,
        async () => {
          const since = subDays(new Date(), days);

          const orders = await securePrisma.roomOrder.findMany(ctx, {
            where: { createdAt: { gte: since } },
            select: { total: true, status: true, createdAt: true },
          });

          const activeStaff = await securePrisma.staff.count(ctx, {
            where: { active: true },
          });

          const rooms = await securePrisma.room.findMany(ctx, {
            where: { status: 'OCCUPIED' },
            select: { id: true },
          });

          const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
          const completedOrders = orders.filter((o: any) => o.status === 'DELIVERED').length;

          const totalRooms = await securePrisma.room.count(ctx);
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
        },
        300, 
      );

      res.json({ success: true, data: kpis });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async revenueByDay(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;
      const days = parseInt(req.query.days as string) || 30;
      const cacheKey = `analytics:revenue:${ctx.hotelId}:${days}`;

      const data = await cacheService.remember(
        cacheKey,
        async () => {
          const orders = await securePrisma.roomOrder.findMany(ctx, {
            where: {
              createdAt: { gte: subDays(new Date(), days) },
              status: 'DELIVERED',
            },
            select: { total: true, createdAt: true },
          });

          const byDay: Record<string, number> = {};
          for (let i = 0; i < days; i++) {
            const d = startOfDay(subDays(new Date(), i));
            byDay[d.toISOString().split('T')[0]] = 0;
          }

          for (const order of orders) {
            const day = startOfDay(order.createdAt).toISOString().split('T')[0];
            if (byDay[day] !== undefined) {
              byDay[day] += Number(order.total);
            }
          }

          return Object.entries(byDay).map(([date, revenue]) => ({
            date,
            revenue,
          })).sort((a, b) => a.date.localeCompare(b.date));
        },
        300,
      );

      res.json({ success: true, data });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
