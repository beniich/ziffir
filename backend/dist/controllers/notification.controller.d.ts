import { Request, Response } from 'express';
export declare class NotificationController {
    /**
     * POST /api/notifications/register
     * Enregistre un push token pour l'utilisateur
     */
    static registerToken(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/notifications/send
     * Envoie une notification à un user/hôtel (admin uniquement)
     */
    static send(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=notification.controller.d.ts.map