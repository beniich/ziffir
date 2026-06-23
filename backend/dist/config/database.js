"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDelete = exports.withRetry = exports.transaction = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = global.__prisma ?? new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['query', 'info', 'warn', 'error'],
    // Connection pooling optimisé via DATABASE_URL
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
if (process.env.NODE_ENV !== 'production') {
    global.__prisma = exports.prisma;
}
const transaction = async (callback) => {
    return exports.prisma.$transaction(callback, {
        maxWait: 5000, // 5s max wait
        timeout: 10000, // 10s timeout
    });
};
exports.transaction = transaction;
// 2. Helper pour les requêtes avec retry
const withRetry = async (fn, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        }
        catch (err) {
            if (i === retries - 1)
                throw err;
            // Exponential backoff
            await new Promise((r) => setTimeout(r, Math.pow(2, i) * 100));
        }
    }
    throw new Error('Max retries reached');
};
exports.withRetry = withRetry;
// 3. Soft delete helper
const softDelete = async (model, id) => {
    return exports.prisma[model].update({
        where: { id },
        data: { deletedAt: new Date() },
    });
};
exports.softDelete = softDelete;
//# sourceMappingURL=database.js.map