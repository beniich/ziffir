"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controllers/invoice.controller");
const rateLimit_1 = require("../config/rateLimit");
const router = (0, express_1.Router)();
// GET /api/invoices/me — CLIENT uniquement (filtré par securePrisma)
router.get('/me', rateLimit_1.readLimiter, invoice_controller_1.InvoiceController.myInvoices);
exports.default = router;
//# sourceMappingURL=invoice.routes.js.map