import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
// import { writeLimiter, readLimiter } from '../config/rateLimit';
// import { validate, schemas } from '../middleware/validation';

const readLimiter = (req: any, res: any, next: any) => next();
const writeLimiter = (req: any, res: any, next: any) => next();
const validate = (schema: any) => (req: any, res: any, next: any) => next();
const schemas = { createStaff: {}, updateClearance: {} };

const router = Router();

router.get('/',         readLimiter,   StaffController.list);
router.get('/:id',      readLimiter,   StaffController.getById);
router.post('/',        writeLimiter,  validate(schemas.createStaff),  StaffController.create);
router.patch('/:id',    writeLimiter,  StaffController.update);
router.patch('/:id/clearance', writeLimiter, validate(schemas.updateClearance), StaffController.updateClearance);
router.delete('/:id',   writeLimiter,  StaffController.deactivate);

export default router;
