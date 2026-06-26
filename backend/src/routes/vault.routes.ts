import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

// GET /api/vault
router.get('/', async (_req: Request, res: Response) => {
  try {
    const docs = await prisma.vaultDocument.findMany({ orderBy: { depositDate: 'desc' } });
    return res.json({ success: true, data: docs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/vault — deposit a document
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category, owner, room, securityLevel } = req.body;
    const doc = await prisma.vaultDocument.create({
      data: { name, category: category || 'General', owner, room: room || '', securityLevel: securityLevel || 'STANDARD' },
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/vault/:id/withdraw
router.put('/:id/withdraw', async (req: Request, res: Response) => {
  try {
    const doc = await prisma.vaultDocument.update({
      where: { id: req.params.id },
      data: { withdrawnAt: new Date() },
    });
    return res.json({ success: true, message: 'Document withdrawn', data: doc });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
