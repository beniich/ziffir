import { Router } from 'express';
import { RoomOrderController } from '../controllers/room-order.controller';
// Assumed imports based on typical structure. Create placeholders if missing.
// import { validate, schemas } from '../middleware/validation';
// import { writeLimiter, readLimiter } from '../config/rateLimit';

const router = Router();

// ⚠️ Plus de requireAuth ici (appliqué globalement)

router.get('/', RoomOrderController.list);

router.get('/:id', RoomOrderController.getById);

router.post('/', RoomOrderController.create);

router.patch('/:id/advance', RoomOrderController.advance);

router.patch('/:id/cancel', RoomOrderController.cancel);

router.delete('/:id', RoomOrderController.remove);

export default router;
