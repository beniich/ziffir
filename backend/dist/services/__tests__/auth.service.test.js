"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_service_1 = require("../auth.service");
// Mock simple pour le test unitaire
(0, vitest_1.describe)('AuthService', () => {
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(auth_service_1.AuthService).toBeDefined();
    });
    // Pour des tests plus poussés, il faudrait mocker Prisma
    // Ce test garantit que l'architecture de test est en place
});
//# sourceMappingURL=auth.service.test.js.map