"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customSecurityHeaders = void 0;
/**
 * Middleware applicatif pour headers de sécurité spécifiques non couverts par Helmet.
 */
const customSecurityHeaders = (req, res, next) => {
    // Cache Control strict pour les API
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    // Empêcher l'exécution de Flash et autres plugins legacy
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    next();
};
exports.customSecurityHeaders = customSecurityHeaders;
//# sourceMappingURL=securityHeaders.js.map