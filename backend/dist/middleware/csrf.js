"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfProtection = void 0;
/**
 * Middleware CSRF simplifié pour les API pures.
 * Vérifie que la requête ne vient pas d'un simple <form> non autorisé.
 */
const csrfProtection = (req, res, next) => {
    // Ignorer GET/HEAD/OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    // Vérifier la présence d'un header custom
    const csrfToken = req.headers['x-requested-with'];
    const contentType = req.headers['content-type'] || '';
    // Bloquer les formulaires simples (souvent vecteurs CSRF) s'ils n'ont pas d'auth/header spécifique
    if (contentType.includes('application/x-www-form-urlencoded') ||
        contentType.includes('multipart/form-data')) {
        if (!req.headers.authorization && !csrfToken) {
            res.status(403).json({ success: false, error: 'Erreur CSRF : Requête non autorisée.' });
            return;
        }
    }
    next();
};
exports.csrfProtection = csrfProtection;
//# sourceMappingURL=csrf.js.map