"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireRole = exports.requireAuth = void 0;
const auth_service_1 = require("../services/auth.service");
/**
 * Middleware : vérifie la présence et validité du JWT access token.
 */
const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: 'Token d\'authentification requis',
        });
        return;
    }
    const token = header.substring(7);
    try {
        const decoded = auth_service_1.AuthService.verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ success: false, error: err.message });
    }
};
exports.requireAuth = requireAuth;
/**
 * Middleware : vérifie que l'utilisateur a l'un des rôles requis.
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Non authentifié' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: `Accès refusé. Rôles requis: ${roles.join(', ')}. Rôle actuel: ${req.user.role}`,
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Middleware : authentification optionnelle (ne bloque pas si pas de token).
 */
const optionalAuth = (req, _res, next) => {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        try {
            const decoded = auth_service_1.AuthService.verifyAccessToken(header.substring(7));
            req.user = decoded;
        }
        catch {
            // Silencieux : optionnel
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map