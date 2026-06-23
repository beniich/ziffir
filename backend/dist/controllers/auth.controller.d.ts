import { Request, Response } from 'express';
export declare class AuthController {
    /**
     * POST /api/auth/register
     */
    static register(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/login
     */
    static login(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/refresh
     */
    static refresh(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/auth/logout
     */
    static logout(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/auth/me — retourne l'utilisateur complet depuis la DB
     */
    static me(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map