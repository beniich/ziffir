import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
// import { readLimiter } from '../config/rateLimit';
const readLimiter = (req: any, res: any, next: any) => next();

const router = Router();

router.get('/overview',         readLimiter, AnalyticsController.overview);
router.get('/revenue-by-day',   readLimiter, AnalyticsController.revenueByDay);

export default router;
