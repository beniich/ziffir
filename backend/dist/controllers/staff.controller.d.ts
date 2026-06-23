import { Request, Response } from 'express';
export declare class StaffController {
    static list(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static create(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static updateClearance(req: Request, res: Response): Promise<void>;
    static deactivate(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=staff.controller.d.ts.map