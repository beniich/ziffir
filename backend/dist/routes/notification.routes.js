"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Enregistrement d'un device (tout utilisateur connecté)
router.post('/register', notification_controller_1.NotificationController.registerToken);
// Envoi manuel de notification (réservé aux admins)
router.post('/send', (0, auth_1.requireRole)('SUPER_ADMIN'), notification_controller_1.NotificationController.send);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map