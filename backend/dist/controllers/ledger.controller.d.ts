import { Request, Response } from 'express';
import type { ApiResponse } from '../types';
export declare class LedgerController {
    /**
     * GET /api/ledger/courses
     */
    static getCourses(req: Request, res: Response<ApiResponse<any>>): Promise<void>;
    /**
     * POST /api/ledger/courses
     */
    static createCourse(req: Request, res: Response<ApiResponse<any>>): Promise<Response<ApiResponse<any>, Record<string, any>> | undefined>;
}
//# sourceMappingURL=ledger.controller.d.ts.map