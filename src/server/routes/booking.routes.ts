// src/server/routes/booking.routes.ts
// ============================================================================
// Public Booking Route — Réservation directe depuis le site marketing
// Endpoint PUBLIC (pas d'authentification requise)
// POST /api/booking/create
// ============================================================================

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auditService } from '../domains/shared/services/audit.service.js';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// Génère un code de confirmation unique ZIF-XXXXXX
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'ZIF-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST /api/booking/create — Créer une réservation depuis le widget public
router.post('/create', async (req: Request, res: Response) => {
  try {
    const {
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,
      guestInfo,
      promoCode,
    } = req.body;

    // --- Validation ---
    if (!hotelId || !roomId || !checkIn || !checkOut || !guestInfo?.email || !guestInfo?.firstName) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Champs requis manquants : hotelId, roomId, checkIn, checkOut, guestInfo.email, guestInfo.firstName',
        },
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: { message: 'Dates invalides' },
      });
    }

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        error: { message: 'La date de départ doit être après la date d\'arrivée' },
      });
    }

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000);
    const confirmationCode = generateConfirmationCode();

    // --- Créer la réservation en base ---
    const booking = await prisma.booking.create({
      data: {
        hotelId,
        roomId,
        confirmationCode,
        guestFirstName: guestInfo.firstName,
        guestLastName: guestInfo.lastName || '',
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone || null,
        specialRequests: guestInfo.specialRequests || null,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        nights,
        guestsCount: guests || 1,
        promoCode: promoCode || null,
        status: 'PENDING_CONFIRMATION',
        externalRef: crypto.randomUUID(),
      },
    });

    // --- Audit trail ---
    await auditService.append({
      eventType: 'booking.create',
      tenantId: hotelId,
      actorId: guestInfo.email,
      actorType: 'user',
      resourceType: 'Booking',
      resourceId: booking.id,
      action: 'booking.create',
      metadata: {
        confirmationCode,
        roomId,
        nights,
        guestEmail: guestInfo.email,
        promoCode: promoCode || null,
      },
      ipAddress: req.ip,
      userAgent: (req.headers['user-agent'] as string) || undefined,
    });

    // TODO: Envoyer un email de confirmation (service email à brancher)
    // await emailService.sendBookingConfirmation({ ...booking, guestInfo });

    res.status(201).json({
      success: true,
      data: {
        bookingId: booking.id,
        confirmationCode: booking.confirmationCode,
        checkIn: booking.checkInDate.toISOString(),
        checkOut: booking.checkOutDate.toISOString(),
        nights: booking.nights,
        status: booking.status,
      },
    });
  } catch (e: any) {
    console.error('[booking] POST /create error', e);
    res.status(500).json({
      success: false,
      error: { message: e.message || 'Erreur serveur' },
    });
  }
});

// GET /api/booking/confirm/:code — Vérifier une réservation par son code
router.get('/confirm/:code', async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { confirmationCode: req.params.code as string },
      include: {
        room: {
          select: { number: true, type: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Réservation introuvable' },
      });
    }

    res.json({ success: true, data: booking });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

export default router;
