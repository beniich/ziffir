import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';

const router = Router();

// GET /api/staff
router.get('/', async (_req: Request, res: Response) => {
  try {
    const staff = await prisma.staffMember.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: staff });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/staff
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, username, password, department, clearanceLevel, role } = req.body;
    const passwordHash = password ? await bcrypt.hash(password, 10) : '';
    const staff = await prisma.staffMember.create({
      data: {
        name,
        email,
        username: username || email.split('@')[0],
        passwordHash,
        department: department || null,
        clearanceLevel: clearanceLevel || 1,
        role: role || 'STAFF',
      },
    });
    return res.status(201).json({ success: true, data: staff });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/staff/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, department, role } = req.body;
    const staff = await prisma.staffMember.update({
      where: { id },
      data: { name, email, department, role },
    });
    return res.json({ success: true, data: staff });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/staff/:id/clearance
router.put('/:id/clearance', async (req: Request, res: Response) => {
  try {
    const staff = await prisma.staffMember.update({
      where: { id: req.params.id },
      data: { clearanceLevel: req.body.clearanceLevel },
    });
    return res.json({ success: true, message: 'Clearance updated', data: staff });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/staff/:id/deactivate
router.put('/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const staff = await prisma.staffMember.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    return res.json({ success: true, message: 'Staff deactivated', data: staff });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
