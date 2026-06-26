import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

// GET /api/pricing
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rules = await prisma.pricingRule.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: rules });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/pricing/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { basePrice, channelMultipliers, status } = req.body;
    const rule = await prisma.pricingRule.update({
      where: { id: req.params.id },
      data: {
        basePrice: basePrice !== undefined ? Number(basePrice) : undefined,
        channelMultipliers: channelMultipliers ? JSON.stringify(channelMultipliers) : undefined,
        status,
      },
    });
    return res.json({ success: true, data: rule });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/pricing/sync
router.post('/sync', async (_req: Request, res: Response) => {
  try {
    await prisma.pricingRule.updateMany({ data: { lastSync: new Date() } });
    return res.json({ success: true, message: 'All pricing rules synced' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
