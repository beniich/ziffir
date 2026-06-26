import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [orders, staff] = await Promise.all([
      prisma.roomServiceOrder.findMany({ where: { createdAt: { gte: since } } }),
      prisma.staffMember.count({ where: { active: true } }),
    ]);

    const totalRevenue = orders.reduce((acc, o) => acc + o.price, 0);
    const completed = orders.filter((o) => o.status === 'DELIVERED').length;
    const pending = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;

    return res.json({
      success: true,
      data: {
        period: { days, since: since.toISOString() },
        orders: { total: orders.length, completed, pending },
        revenue: {
          total: totalRevenue,
          average: orders.length > 0 ? totalRevenue / orders.length : 0,
        },
        occupancy: { occupied: 0, total: 0, rate: 0 },
        staff: { active: staff },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/revenue
router.get('/revenue', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await prisma.roomServiceOrder.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const revenueByDay: Record<string, number> = {};
    for (const order of orders) {
      const day = order.createdAt.toISOString().split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + order.price;
    }

    const data = Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue }));
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
