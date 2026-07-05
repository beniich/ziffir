import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
// Mocking PrismaClient and emailService for integration since this is a frontend-centric app without the actual Prisma schema or email service set up yet.
// import { PrismaClient } from '@prisma/client';
// import { emailService } from '../lib/email';

const router = Router();
// const prisma = new PrismaClient();

const subscribeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  interests: z.array(z.string()).optional(),
  source: z.string().optional(),
});

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  const parsed = subscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      success: false, 
      error: { message: 'Email invalide' } 
    });
  }
  
  const { email, firstName, interests = ['product'], source = 'unknown' } = parsed.data;
  
  try {
    /* MOCKED BACKEND LOGIC
    // Vérifie si déjà inscrit
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    
    if (existing?.confirmedAt) {
      return res.json({ 
        success: true, 
        data: { alreadySubscribed: true } 
      });
    }
    
    // Crée ou met à jour
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    */
    
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    
    // Email de confirmation (double opt-in)
    const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/newsletter/confirm?token=${confirmationToken}`;
    
    console.log(`Mock: Envoi email à ${email} pour confirmation à l'url ${confirmUrl}`);

    res.json({ success: true, data: { status: 'confirm_email_sent' }});
  } catch (error: any) {
    console.error('Newsletter error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
  }
});

export default router;
