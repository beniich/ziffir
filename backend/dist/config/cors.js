"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = void 0;
const cors_1 = __importDefault(require("cors"));
const allowedOrigins = [
    'http://localhost:5173', // Frontend dev
    'http://localhost:3000', // Frontend alt
    process.env.FRONTEND_URL || ''
].filter(Boolean);
exports.corsConfig = (0, cors_1.default)({
    origin: (origin, callback) => {
        // Autoriser les requêtes sans origine (ex: curl, postman) seulement en dev
        if (!origin && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('CORS Error: Origin not allowed'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'CSRF-Token'],
    credentials: true,
    maxAge: 86400, // Cache preflight requests for 24h
});
//# sourceMappingURL=cors.js.map