import { Router } from 'express';
import {
  getRoomServiceOrders,
  createRoomServiceOrder,
  updateRoomServiceOrderStatus,
  getRoomServiceCatalog,
} from '../controllers/room-service.controller';

const router = Router();

// Endpoint pour le catalogue
router.get('/catalog', getRoomServiceCatalog);

// Endpoints pour les commandes
router.get('/', getRoomServiceOrders);
router.post('/', createRoomServiceOrder);
router.patch('/:id/status', updateRoomServiceOrderStatus);

export default router;
