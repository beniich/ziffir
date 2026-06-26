import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

// GET /api/controls
router.get('/', async (_req: Request, res: Response) => {
  try {
    const controls = await prisma.suiteControl.findMany();
    return res.json({ success: true, data: controls });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/controls/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { lights, climate, curtains, music, musicVolume, doNotDisturb } = req.body;
    const control = await prisma.suiteControl.update({
      where: { id: req.params.id },
      data: { lights, climate, curtains, music, musicVolume, doNotDisturb },
    });
    return res.json({ success: true, data: control });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
