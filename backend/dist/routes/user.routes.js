"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../config/rateLimit");
const router = (0, express_1.Router)();
// 🔐 Réservé SUPER_ADMIN uniquement (ISO 27001 A.9.2.3)
router.get('/', (0, auth_1.requireRole)('SUPER_ADMIN'), rateLimit_1.readLimiter, user_controller_1.UserController.list);
router.patch('/:id', (0, auth_1.requireRole)('SUPER_ADMIN'), rateLimit_1.writeLimiter, user_controller_1.UserController.update);
router.patch('/:id/deactivate', (0, auth_1.requireRole)('SUPER_ADMIN'), rateLimit_1.writeLimiter, user_controller_1.UserController.deactivate);
exports.default = router;
//# sourceMappingURL=user.routes.js.map