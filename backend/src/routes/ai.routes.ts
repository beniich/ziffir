import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const router = Router();

router.post('/chat', AIController.chat);
router.get('/suggestions/orders', AIController.orderSuggestions);

export default router;
