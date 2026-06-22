import { Router } from 'express';
import { VaultController } from '../controllers/vault.controller';
// import { writeLimiter, readLimiter } from '../config/rateLimit';

const readLimiter = (req: any, res: any, next: any) => next();
const writeLimiter = (req: any, res: any, next: any) => next();

const router = Router();

router.get('/documents',          readLimiter,  VaultController.list);
router.get('/documents/:id',      readLimiter,  VaultController.getById);
router.post('/documents',         writeLimiter, VaultController.deposit);
router.patch('/documents/:id/withdraw', writeLimiter, VaultController.withdraw);

export default router;
