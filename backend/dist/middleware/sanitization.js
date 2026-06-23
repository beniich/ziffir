"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInputs = void 0;
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
/**
 * Middleware de sanitization des inputs (XSS Protection).
 * Nettoie le body, query et params de toute balise script ou HTML malveillant.
 */
const sanitizeInputs = (req, res, next) => {
    try {
        const sanitizeObj = (obj) => {
            if (typeof obj === 'string') {
                return isomorphic_dompurify_1.default.sanitize(obj, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
            }
            if (typeof obj === 'object' && obj !== null) {
                if (Array.isArray(obj)) {
                    return obj.map(item => sanitizeObj(item));
                }
                const newObj = {};
                for (const key in obj) {
                    // Check for NoSQL injection keys (e.g. $gt, $ne)
                    if (key.startsWith('$')) {
                        throw new Error(`Invalid key detected: ${key}`);
                    }
                    newObj[key] = sanitizeObj(obj[key]);
                }
                return newObj;
            }
            return obj;
        };
        if (req.body)
            req.body = sanitizeObj(req.body);
        if (req.query)
            req.query = sanitizeObj(req.query);
        if (req.params)
            req.params = sanitizeObj(req.params);
        next();
    }
    catch (error) {
        res.status(400).json({ success: false, error: 'Données invalides détectées (Sanitization)' });
    }
};
exports.sanitizeInputs = sanitizeInputs;
//# sourceMappingURL=sanitization.js.map