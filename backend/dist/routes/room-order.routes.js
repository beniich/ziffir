"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_order_controller_1 = require("../controllers/room-order.controller");
// Assumed imports based on typical structure. Create placeholders if missing.
// import { validate, schemas } from '../middleware/validation';
// import { writeLimiter, readLimiter } from '../config/rateLimit';
const router = (0, express_1.Router)();
// ⚠️ Plus de requireAuth ici (appliqué globalement)
router.get('/', room_order_controller_1.RoomOrderController.list);
router.get('/:id', room_order_controller_1.RoomOrderController.getById);
router.post('/', room_order_controller_1.RoomOrderController.create);
router.patch('/:id/advance', room_order_controller_1.RoomOrderController.advance);
router.patch('/:id/cancel', room_order_controller_1.RoomOrderController.cancel);
router.delete('/:id', room_order_controller_1.RoomOrderController.remove);
exports.default = router;
//# sourceMappingURL=room-order.routes.js.map