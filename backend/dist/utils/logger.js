"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Console format (more readable for development)
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${message} ${stack || ''}`;
}));
// Create the logger instance
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
    transports: [
        // Write all logs with importance level of `error` or higher to `error.log`
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../../../logs/error.log'),
            level: 'error'
        }),
        // Write all logs with importance level of `info` or higher to `combined.log`
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../../../logs/combined.log')
        }),
    ],
});
// If we're not in production, log to the `console` with the custom format
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
    }));
}
//# sourceMappingURL=logger.js.map