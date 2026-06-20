import { Router } from 'express';
import { getAudits, createAudit } from '../controllers/audit.controller';

const router = Router();

router.get('/', getAudits);
router.post('/', createAudit);

export default router;
