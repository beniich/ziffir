"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    /**
     * POST /api/auth/register
     */
    static async register(req, res) {
        try {
            const { email, username, password, role } = req.body;
            const result = await auth_service_1.AuthService.register(email, username, password, role);
            res.status(201).json({ success: true, data: result });
        }
        catch (err) {
            const status = err.message.includes('déjà') ? 409 : 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    /**
     * POST /api/auth/login
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.AuthService.login(email, password);
            res.json({ success: true, data: result });
        }
        catch (err) {
            res.status(401).json({ success: false, error: err.message });
        }
    }
    /**
     * POST /api/auth/refresh
     */
    static async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            const tokens = await auth_service_1.AuthService.refresh(refreshToken);
            res.json({ success: true, data: tokens });
        }
        catch (err) {
            res.status(401).json({ success: false, error: err.message });
        }
    }
    /**
     * POST /api/auth/logout
     */
    static async logout(req, res) {
        if (req.user) {
            await auth_service_1.AuthService.logout(req.user.userId);
        }
        res.json({ success: true, message: 'Déconnecté avec succès' });
    }
    /**
     * GET /api/auth/me — retourne l'utilisateur complet depuis la DB
     */
    static async me(req, res) {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Non authentifié' });
            return;
        }
        try {
            const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
            const prisma = new PrismaClient();
            const user = await prisma.user.findUnique({
                where: { id: req.user.userId },
                select: { id: true, email: true, username: true, role: true, hotelId: true, isActive: true, createdAt: true },
            });
            if (!user || !user.isActive) {
                res.status(401).json({ success: false, error: 'Utilisateur introuvable ou désactivé' });
                return;
            }
            res.json({ success: true, data: user });
        }
        catch {
            res.status(500).json({ success: false, error: 'Erreur serveur' });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map