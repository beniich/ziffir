"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rateLimit_1 = require("../config/rateLimit");
const router = (0, express_1.Router)();
router.post('/register', rateLimit_1.authLimiter, (0, validation_1.validate)(validation_1.schemas.register), auth_controller_1.AuthController.register);
router.post('/login', rateLimit_1.authLimiter, (0, validation_1.validate)(validation_1.schemas.login), auth_controller_1.AuthController.login);
router.post('/refresh', rateLimit_1.authLimiter, (0, validation_1.validate)(validation_1.schemas.refresh), auth_controller_1.AuthController.refresh);
router.post('/logout', auth_1.requireAuth, auth_controller_1.AuthController.logout);
router.get('/me', auth_1.requireAuth, auth_controller_1.AuthController.me);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map