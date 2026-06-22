import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { readLimiter } from '../config/rateLimit';

const router = Router();

// GET /api/invoices/me — CLIENT uniquement (filtré par securePrisma)
router.get('/me', readLimiter, InvoiceController.myInvoices);

export default router;
