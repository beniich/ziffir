import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
// import { writeLimiter, readLimiter } from '../config/rateLimit';
// import { validate, schemas } from '../middleware/validation';
const readLimiter = (req: any, res: any, next: any) => next();
const writeLimiter = (req: any, res: any, next: any) => next();
const validate = (schema: any) => (req: any, res: any, next: any) => next();
const schemas = { createAudit: {} };

const router = Router();

router.get('/',          readLimiter,   AuditController.list);
router.post('/',         writeLimiter,  validate(schemas.createAudit), AuditController.create);
router.get('/verify',    readLimiter,   AuditController.verify);

export default router;
