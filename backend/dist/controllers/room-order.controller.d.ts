import { Request, Response } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare class RoomOrderController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: Request, res: Response): Promise<void>;
    static advance(req: Request, res: Response): Promise<void>;
    static cancel(req: Request, res: Response): Promise<void>;
    static remove(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=room-order.controller.d.ts.map