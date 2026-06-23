import { Router } from 'express';
import { getMenu, getOrders, createOrder } from '../controllers/room-service.controller.js';
const router = Router();
router.get('/menu', getMenu);
router.get('/orders', getOrders);
router.post('/orders', createOrder);
export default router;
