import { Router } from 'express';
import { getLedgerCourses, addLedgerCourse, removeLedgerCourse } from '../controllers/ledger.controller';

const router = Router();

router.get('/courses', getLedgerCourses);
router.post('/courses', addLedgerCourse);
router.delete('/courses/:id', removeLedgerCourse);

export default router;
