"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pricing_controller_1 = require("../controllers/pricing.controller");
// import { writeLimiter, readLimiter } from '../config/rateLimit';
const readLimiter = (req, res, next) => next();
const writeLimiter = (req, res, next) => next();
const router = (0, express_1.Router)();
router.get('/rules', readLimiter, pricing_controller_1.PricingController.list);
router.patch('/rules/:id', writeLimiter, pricing_controller_1.PricingController.update);
router.post('/sync', writeLimiter, pricing_controller_1.PricingController.syncAll);
exports.default = router;
//# sourceMappingURL=pricing.routes.js.map