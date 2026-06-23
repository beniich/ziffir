"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const ai_service_1 = require("../services/ai.service");
const errorHandler_1 = require("../middleware/errorHandler");
class AIController {
    /**
     * POST /api/ai/chat
     */
    static async chat(req, res) {
        try {
            const ctx = req.user;
            const { messages, provider } = req.body;
            if (!messages || !Array.isArray(messages)) {
                throw new errorHandler_1.AppError(400, 'messages requis');
            }
            const result = await ai_service_1.AIService.chat(messages, {
                userId: ctx.userId,
                hotelId: ctx.hotelId ?? undefined,
                userRole: ctx.role,
            }, { provider });
            res.json({
                success: true,
                data: {
                    content: result.content,
                    tokens: result.tokens,
                    cost: result.cost,
                },
            });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    /**
     * GET /api/ai/suggestions/orders
     * Suggestions d'amélioration pour l'hôtel
     */
    static async orderSuggestions(req, res) {
        try {
            const ctx = req.user;
            if (ctx.role !== 'HOTEL' && ctx.role !== 'SUPER_ADMIN') {
                throw new errorHandler_1.AppError(403, 'Réservé aux hôtels');
            }
            const hotelId = ctx.hotelId;
            const suggestions = await ai_service_1.AIService.suggestOrderImprovements(hotelId);
            res.json({ success: true, data: { suggestions } });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.AIController = AIController;
//# sourceMappingURL=ai.controller.js.map