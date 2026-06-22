import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { UserContext } from '../services/permissions.service';
import { AppError } from '../middleware/errorHandler';

export class AIController {
  /**
   * POST /api/ai/chat
   */
  static async chat(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as UserContext;
      const { messages, provider } = req.body;

      if (!messages || !Array.isArray(messages)) {
        throw new AppError(400, 'messages requis');
      }

      const result = await AIService.chat(messages, {
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
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/ai/suggestions/orders
   * Suggestions d'amélioration pour l'hôtel
   */
  static async orderSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const ctx = req.user as UserContext;
      if (ctx.role !== 'HOTEL' && ctx.role !== 'SUPER_ADMIN') {
        throw new AppError(403, 'Réservé aux hôtels');
      }

      const hotelId = ctx.hotelId!;
      const suggestions = await AIService.suggestOrderImprovements(hotelId);

      res.json({ success: true, data: { suggestions } });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
