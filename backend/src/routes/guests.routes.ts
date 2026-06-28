import { Router } from 'express';
import guestDomainRouter from '../domains/hotel/guest/guest.routes.js';

const router = Router();

// Forward all requests to the domain router (PII-encrypted, RGPD-compliant)
router.use('/', guestDomainRouter);

export default router;
