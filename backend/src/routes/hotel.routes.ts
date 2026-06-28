import { Router } from 'express';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { requireAuth, requireRole } from '../domains/identity/auth/auth.middleware.js';

const router = Router();

// Lecture : tous les utilisateurs authentifiés
router.get('/', requireAuth, async (req, res) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: req.user!.hotelId },
    include: {
      _count: { select: { rooms: true, users: true, tasks: true } },
    },
  });
  res.json({ hotel });
});

// Mutation : ADMIN ou MANAGER uniquement
router.patch('/', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  const updated = await prisma.hotel.update({
    where: { id: req.user!.hotelId },
    data: req.body,
  });
  res.json({ hotel: updated });
});

export default router;
