import { Request, Response } from 'express';
import { MLPredictionsService } from '../services/ml-predictions.service';
import { UserContext } from '../services/permissions.service';
import { AppError } from '../middleware/errorHandler';

export class MLController {
  static async getForecast(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as UserContext;
      if (ctx.role !== 'HOTEL' && ctx.role !== 'SUPER_ADMIN') {
        throw new AppError(403, 'Accès refusé');
      }

      const days = Number(req.query.days) || 7;
      const predictions = await MLPredictionsService.forecastOccupancy(ctx.hotelId!, days);

      res.json({ success: true, data: predictions });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async getAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as UserContext;
      if (ctx.role !== 'HOTEL' && ctx.role !== 'SUPER_ADMIN') {
        throw new AppError(403, 'Accès refusé');
      }

      const anomalies = await MLPredictionsService.detectAnomalies(ctx.hotelId!);

      res.json({ success: true, data: anomalies });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
