import { Router } from 'express';
import { PricingController } from '../controllers/pricing.controller';
// import { writeLimiter, readLimiter } from '../config/rateLimit';

const readLimiter = (req: any, res: any, next: any) => next();
const writeLimiter = (req: any, res: any, next: any) => next();

const router = Router();

router.get('/rules',     readLimiter,   PricingController.list);
router.patch('/rules/:id', writeLimiter, PricingController.update);
router.post('/sync',     writeLimiter,  PricingController.syncAll);

export default router;
