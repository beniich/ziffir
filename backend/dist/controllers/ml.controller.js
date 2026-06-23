"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLController = void 0;
const ml_predictions_service_1 = require("../services/ml-predictions.service");
const errorHandler_1 = require("../middleware/errorHandler");
class MLController {
    static async getForecast(req, res) {
        try {
            const ctx = req.user;
            if (ctx.role !== 'HOTEL' && ctx.role !== 'SUPER_ADMIN') {
                throw new errorHandler_1.AppError(403, 'Accès refusé');
            }
            const days = Number(req.query.days) || 7;
            const predictions = await ml_predictions_service_1.MLPredictionsService.forecastOccupancy(ctx.hotelId, days);
            res.json({ success: true, data: predictions });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
    static async getAnomalies(req, res) {
        try {
            const ctx = req.user;
            if (ctx.role !== 'HOTEL' && ctx.role !== 'SUPER_ADMIN') {
                throw new errorHandler_1.AppError(403, 'Accès refusé');
            }
            const anomalies = await ml_predictions_service_1.MLPredictionsService.detectAnomalies(ctx.hotelId);
            res.json({ success: true, data: anomalies });
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.MLController = MLController;
//# sourceMappingURL=ml.controller.js.map