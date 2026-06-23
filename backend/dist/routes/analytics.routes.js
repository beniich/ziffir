"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
// import { readLimiter } from '../config/rateLimit';
const readLimiter = (req, res, next) => next();
const router = (0, express_1.Router)();
router.get('/overview', readLimiter, analytics_controller_1.AnalyticsController.overview);
router.get('/revenue-by-day', readLimiter, analytics_controller_1.AnalyticsController.revenueByDay);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map