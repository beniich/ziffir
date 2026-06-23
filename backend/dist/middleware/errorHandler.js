"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.notFoundHandler = exports.AppError = void 0;
/**
 * Erreur applicative typée (avec status HTTP).
 */
class AppError extends Error {
    statusCode;
    message;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
/**
 * 404 handler — à placer APRÈS toutes les routes.
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} introuvable`,
    });
};
exports.notFoundHandler = notFoundHandler;
/**
 * Error handler global — à placer en DERNIER dans app.ts.
 */
const errorHandler = (err, req, res, _next) => {
    // Log structuré
    console.error({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        error: err.message,
        name: err.name,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        userId: req.user?.userId,
    });
    // Erreur applicative typée
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, error: err.message });
        return;
    }
    // Erreurs Prisma connues
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaErr = err;
        if (prismaErr.code === 'P2002') {
            res.status(409).json({ success: false, error: 'Cette valeur existe déjà (contrainte d\'unicité)' });
            return;
        }
        if (prismaErr.code === 'P2025') {
            res.status(404).json({ success: false, error: 'Ressource introuvable' });
            return;
        }
    }
    // Erreurs Zod
    if (err.name === 'ZodError') {
        res.status(400).json({
            success: false,
            error: 'Données invalides',
            details: err.errors,
        });
        return;
    }
    // Erreur JWT
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
        return;
    }
    // Erreur générique
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Erreur serveur interne'
            : err.message,
    });
};
exports.errorHandler = errorHandler;
/**
 * Wrapper pour les controllers async (évite try/catch répétés).
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map