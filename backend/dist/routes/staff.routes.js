"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staff_controller_1 = require("../controllers/staff.controller");
// import { writeLimiter, readLimiter } from '../config/rateLimit';
// import { validate, schemas } from '../middleware/validation';
const readLimiter = (req, res, next) => next();
const writeLimiter = (req, res, next) => next();
const validate = (schema) => (req, res, next) => next();
const schemas = { createStaff: {}, updateClearance: {} };
const router = (0, express_1.Router)();
router.get('/', readLimiter, staff_controller_1.StaffController.list);
router.get('/:id', readLimiter, staff_controller_1.StaffController.getById);
router.post('/', writeLimiter, validate(schemas.createStaff), staff_controller_1.StaffController.create);
router.patch('/:id', writeLimiter, staff_controller_1.StaffController.update);
router.patch('/:id/clearance', writeLimiter, validate(schemas.updateClearance), staff_controller_1.StaffController.updateClearance);
router.delete('/:id', writeLimiter, staff_controller_1.StaffController.deactivate);
exports.default = router;
//# sourceMappingURL=staff.routes.js.map