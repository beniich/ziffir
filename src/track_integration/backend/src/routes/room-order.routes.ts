import { Router } from 'express';
import { RoomOrderController } from '../controllers/room-order.controller';
import { validate, schemas } from '../middleware/validation';
import { writeLimiter, readLimiter } from '../config/rateLimit';

const router = Router();

// Enforced globally in main index routing loader - no duplicate requireAuth here!

router.get('/',
  readLimiter,
  RoomOrderController.list
);

router.get('/:id',
  readLimiter,
  RoomOrderController.getById
);

router.post('/',
  writeLimiter,
  validate(schemas.createOrder),
  RoomOrderController.create
);

router.patch('/:id/advance',
  writeLimiter,
  RoomOrderController.advance
);

router.patch('/:id/cancel',
  writeLimiter,
  RoomOrderController.cancel
);

router.delete('/:id',
  writeLimiter,
  RoomOrderController.remove
);

export default router;
