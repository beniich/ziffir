import { Router } from 'express';
import { ControlsController } from '../controllers/controls.controller';
// import { writeLimiter, readLimiter } from '../config/rateLimit';

const readLimiter = (req: any, res: any, next: any) => next();
const writeLimiter = (req: any, res: any, next: any) => next();

const router = Router();

router.get('/',        readLimiter,   ControlsController.list);
router.patch('/:id',   writeLimiter,  ControlsController.update);

export default router;
