import { Request, Response } from 'express';
import type { ApiResponse } from '../types';
export declare class RoomServiceController {
    /**
     * GET /api/room-service/menu
     */
    static getMenu(req: Request, res: Response<ApiResponse<any>>): Promise<void>;
    /**
     * GET /api/room-service/orders
     */
    static getOrders(req: Request, res: Response<ApiResponse<any>>): Promise<void>;
    /**
     * POST /api/room-service/orders
     */
    static createOrder(req: Request, res: Response<ApiResponse<any>>): Promise<Response<ApiResponse<any>, Record<string, any>> | undefined>;
    /**
     * PATCH /api/room-service/orders/:id/advance
     */
    static advanceOrder(req: Request, res: Response<ApiResponse<any>>): Promise<Response<ApiResponse<any>, Record<string, any>> | undefined>;
}
//# sourceMappingURL=room-service.controller.d.ts.map