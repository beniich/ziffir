// src/routes/index.ts

import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { RoomServiceController } from '../controllers/room-service.controller';
import { LedgerController } from '../controllers/ledger.controller';
import { StaffController } from '../controllers/staff.controller';
import { VaultController } from '../controllers/vault.controller';
import { ControlsController } from '../controllers/controls.controller';
import { getConnectedClientsCount } from '../websocket/ws.server';

const router = Router();

// ════════════════════════════════════════════════════════════
// HEALTH CHECK
// ════════════════════════════════════════════════════════════
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      uptime: process.uptime(),
      wsClients: getConnectedClientsCount(),
      timestamp: new Date().toISOString(),
    },
  });
});

// ════════════════════════════════════════════════════════════
// AUDITS
// ════════════════════════════════════════════════════════════
router.get('/audits', AuditController.getAll);
router.post('/audits', AuditController.create);
router.get('/audits/verify', AuditController.verify);

// ════════════════════════════════════════════════════════════
// ROOM SERVICE
// ════════════════════════════════════════════════════════════
router.get('/room-service/menu', RoomServiceController.getMenu);
router.get('/room-service/orders', RoomServiceController.getOrders);
router.post('/room-service/orders', RoomServiceController.createOrder);
router.patch('/room-service/orders/:id/advance', RoomServiceController.advanceOrder);

// ════════════════════════════════════════════════════════════
// LEDGER
// ════════════════════════════════════════════════════════════
router.get('/ledger/courses', LedgerController.getCourses);
router.post('/ledger/courses', LedgerController.createCourse);

// ════════════════════════════════════════════════════════════
// STAFF
// ════════════════════════════════════════════════════════════
router.get('/staff', StaffController.getAll);
router.post('/staff', StaffController.create);
router.patch('/staff/:id/clearance', StaffController.updateClearance);

// ════════════════════════════════════════════════════════════
// VAULT
// ════════════════════════════════════════════════════════════
router.get('/vault/documents', VaultController.getDocuments);
router.post('/vault/documents', VaultController.addDocument);
router.patch('/vault/documents/:id/withdraw', VaultController.withdrawDocument);

// ════════════════════════════════════════════════════════════
// CONTROLS
// ════════════════════════════════════════════════════════════
router.get('/controls/suites', ControlsController.getAll);
router.patch('/controls/suites/:id', ControlsController.updateControl);

export default router;
