"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
// import { writeLimiter, readLimiter } from '../config/rateLimit';
// import { validate, schemas } from '../middleware/validation';
const readLimiter = (req, res, next) => next();
const writeLimiter = (req, res, next) => next();
const validate = (schema) => (req, res, next) => next();
const schemas = { createAudit: {} };
const router = (0, express_1.Router)();
router.get('/', readLimiter, audit_controller_1.AuditController.list);
router.post('/', writeLimiter, validate(schemas.createAudit), audit_controller_1.AuditController.create);
router.get('/verify', readLimiter, audit_controller_1.AuditController.verify);
exports.default = router;
//# sourceMappingURL=audit.routes.js.map