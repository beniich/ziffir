import { Router } from 'express';
import { auditController } from './audit.controller';

const router = Router();

// GET /api/audit/logs - Fetch paginated audit logs for the current hotel
router.get('/logs', auditController.getLogs);

// GET /api/audit/export - Download CSV of the audit trail
router.get('/export', auditController.exportCsv);

// POST /api/audit/verify - Verify cryptographic chain integrity
router.post('/verify', auditController.verify);

export default router;
