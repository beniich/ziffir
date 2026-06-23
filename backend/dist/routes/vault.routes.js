"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vault_controller_1 = require("../controllers/vault.controller");
// import { writeLimiter, readLimiter } from '../config/rateLimit';
const readLimiter = (req, res, next) => next();
const writeLimiter = (req, res, next) => next();
const router = (0, express_1.Router)();
router.get('/documents', readLimiter, vault_controller_1.VaultController.list);
router.get('/documents/:id', readLimiter, vault_controller_1.VaultController.getById);
router.post('/documents', writeLimiter, vault_controller_1.VaultController.deposit);
router.patch('/documents/:id/withdraw', writeLimiter, vault_controller_1.VaultController.withdraw);
exports.default = router;
//# sourceMappingURL=vault.routes.js.map