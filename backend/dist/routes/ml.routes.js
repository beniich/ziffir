"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ml_controller_1 = require("../controllers/ml.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/forecast', auth_1.requireAuth, ml_controller_1.MLController.getForecast);
router.get('/anomalies', auth_1.requireAuth, ml_controller_1.MLController.getAnomalies);
exports.default = router;
//# sourceMappingURL=ml.routes.js.map