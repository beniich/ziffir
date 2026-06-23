"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controls_controller_1 = require("../controllers/controls.controller");
// import { writeLimiter, readLimiter } from '../config/rateLimit';
const readLimiter = (req, res, next) => next();
const writeLimiter = (req, res, next) => next();
const router = (0, express_1.Router)();
router.get('/', readLimiter, controls_controller_1.ControlsController.list);
router.patch('/:id', writeLimiter, controls_controller_1.ControlsController.update);
exports.default = router;
//# sourceMappingURL=controls.routes.js.map