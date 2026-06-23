import { Request, Response } from 'express';
export declare class AIController {
    /**
     * POST /api/ai/chat
     */
    static chat(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/ai/suggestions/orders
     * Suggestions d'amélioration pour l'hôtel
     */
    static orderSuggestions(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ai.controller.d.ts.map