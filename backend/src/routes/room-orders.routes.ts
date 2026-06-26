import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

// GET /api/room-orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.roomServiceOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/room-orders
router.post('/', async (req: Request, res: Response) => {
  try {
    const { guestName, roomNo, details, price } = req.body;
    if (!guestName || !roomNo || !details || price === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const order = await prisma.roomServiceOrder.create({
      data: { guestName, roomNo, details, price: Number(price) },
    });
    return res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/room-orders/:id/status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.roomServiceOrder.update({
      where: { id },
      data: { status },
    });
    return res.json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/room-orders/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.roomServiceOrder.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Order deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
