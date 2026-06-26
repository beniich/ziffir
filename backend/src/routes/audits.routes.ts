import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../server';

const router = Router();

// GET /api/audits
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { user: { select: { username: true, email: true } } },
    });
    const data = logs.map((l) => ({
      id: l.id,
      logId: l.id,
      action: l.action,
      reason: l.reason,
      status: l.status,
      previousHash: l.previousHash,
      hash: l.hash,
      timestamp: l.timestamp.toISOString(),
      userName: l.user?.username,
      userId: l.userId,
    }));
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/audits
router.post('/', async (req: Request, res: Response) => {
  try {
    const { action, reason, status, role, userId } = req.body;

    // Get last hash for blockchain chain
    const last = await prisma.auditLog.findFirst({ orderBy: { timestamp: 'desc' } });
    const previousHash = last?.hash || '0000000000000000';

    const payload = `${action}|${reason}|${status}|${previousHash}|${Date.now()}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    const log = await prisma.auditLog.create({
      data: {
        action,
        reason: reason || '',
        status: status || 'AUTHORIZED',
        role: role || 'SYSTEM',
        previousHash,
        hash,
        userId: userId || null,
      },
    });

    return res.status(201).json({ success: true, data: log });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/audits/verify — verify blockchain integrity
router.get('/verify', async (_req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'asc' } });
    let valid = true;
    let brokenAt: number | undefined;

    for (let i = 1; i < logs.length; i++) {
      if (logs[i].previousHash !== logs[i - 1].hash) {
        valid = false;
        brokenAt = i;
        break;
      }
    }

    return res.json({ success: true, data: { valid, total: logs.length, brokenAt } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
