import { Router } from 'express';
import { MLController } from '../controllers/ml.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/forecast', requireAuth, MLController.getForecast);
router.get('/anomalies', requireAuth, MLController.getAnomalies);

export default router;
