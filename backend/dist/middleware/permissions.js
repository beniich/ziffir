"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.Role = void 0;
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
})(Role || (exports.Role = Role = {}));
/**
 * Middleware d'autorisation RBAC (Role-Based Access Control).
 * @param allowedRoles Liste des rôles autorisés à accéder à la ressource.
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role) {
            res.status(401).json({ success: false, error: 'Non authentifié ou rôle introuvable.' });
            return;
        }
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({ success: false, error: 'Accès refusé. Privilèges insuffisants.' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=permissions.js.map