"use strict";
// src/services/sanitize.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizeService = void 0;
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
/**
 * Service de sanitization des inputs utilisateur.
 * Bloque toute injection HTML/JS (XSS).
 */
class SanitizeService {
    /**
     * Nettoie une chaîne de texte en supprimant tout HTML/script.
     */
    static text(input) {
        if (typeof input !== 'string')
            return '';
        return isomorphic_dompurify_1.default.sanitize(input, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
            KEEP_CONTENT: true,
        }).trim();
    }
    /**
     * Nettoie un champ optionnel (retourne null si vide).
     */
    static textOptional(input) {
        if (input === null || input === undefined)
            return null;
        const cleaned = this.text(input);
        return cleaned === '' ? null : cleaned;
    }
    /**
     * Valide et nettoie un email.
     */
    static email(input) {
        const cleaned = this.text(input);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(cleaned) ? cleaned : null;
    }
    /**
     * Sanitize récursivement un objet.
     */
    static object(obj) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                result[key] = this.text(value);
            }
            else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                result[key] = this.object(value);
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
}
exports.SanitizeService = SanitizeService;
//# sourceMappingURL=sanitize.service.js.map