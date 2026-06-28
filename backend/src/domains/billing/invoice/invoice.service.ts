/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { stripe, isStripeMock } from '../../../infrastructure/payment/stripe.client.js';
import { generateInvoiceReference } from '../../../services/reference.service.js';
import { env } from '../../../config/env.js';
import type { Prisma, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { PaymentStatus } from '@prisma/client';

type CreateInvoiceInput = {
  reservationId: string;
  hotelId: string;
  // Si non spécifié, on génère depuis la résa
  customLineItems?: Array<{
    description: string;
    quantity?: number;
    unitPriceCents: number;
    taxRate?: number;
    category?: string;
  }>;
  // Options
  taxRate?: number;
  dueInDays?: number;
  language?: 'fr' | 'en';
  notes?: string;
  internalNotes?: string;
};

type InvoiceWithDetails = Prisma.InvoiceGetPayload<{
  include: {
    lineItems: true;
    payments: true;
    reservation: { include: { guest: true; room: true } };
    guest: true;
    hotel: true;
  };
}>;

/**
 * Crée une facture (en DRAFT) depuis une réservation.
 * Génère automatiquement les lignes depuis la résa.
 */
export async function createInvoiceFromReservation(input: CreateInvoiceInput): Promise<InvoiceWithDetails> {
  const reservation = await prisma.reservation.findFirst({
    where: { id: input.reservationId, hotelId: input.hotelId },
    include: { room: true },
  });
  if (!reservation) throw new Error('Réservation introuvable');
  
  if (reservation.status === 'CANCELLED' || reservation.status === 'NO_SHOW') {
    throw new Error('Impossible de facturer une réservation annulée ou no-show');
  }
  
  // Vérifier qu'il n'y a pas déjà de facture
  const existing = await prisma.invoice.findUnique({
    where: { reservationId: reservation.id },
  });
  if (existing) {
    throw new Error('Une facture existe déjà pour cette réservation');
  }
  
  const taxRate = input.taxRate ?? 0.1;
  const lineItemsData: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    taxRate: number;
    totalCents: number;
    category: string;
    position: number;
  }> = [];
  
  let pos = 0;
  
  // Lignes custom fournies
  for (const li of input.customLineItems ?? []) {
    const qty = li.quantity ?? 1;
    const total = qty * li.unitPriceCents;
    lineItemsData.push({
      description: li.description,
      quantity: qty,
      unitPriceCents: li.unitPriceCents,
      taxRate: li.taxRate ?? taxRate,
      totalCents: total,
      category: li.category ?? 'EXTRA',
      position: pos++,
    });
  }
  
  // Si pas de lignes custom, générer depuis la résa
  if (lineItemsData.length === 0) {
    // Ligne principale : chambre × nuits
    lineItemsData.push({
      description: `Chambre ${reservation.room?.type ?? 'Standard'}${reservation.room ? ` (n°${reservation.room.number})` : ''} — ${reservation.nights} nuit(s)`,
      quantity: reservation.nights,
      unitPriceCents: Math.round(reservation.pricePerNight * 100),
      taxRate,
      totalCents: Math.round((reservation.pricePerNight * reservation.nights) * 100),
      category: 'ROOM',
      position: pos++,
    });
    
    // Taxes (si pas déjà incluses dans le subtotal)
    // Extra
    if (reservation.extras > 0) {
      lineItemsData.push({
        description: 'Services additionnels',
        quantity: 1,
        unitPriceCents: Math.round(reservation.extras * 100),
        taxRate,
        totalCents: Math.round(reservation.extras * 100),
        category: 'EXTRA',
        position: pos++,
      });
    }
  }
  
  // Calculs
  const subtotalCents = lineItemsData.reduce((s, li) => s + li.totalCents, 0);
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;
  
  const reference = await generateInvoiceReference(input.hotelId);
  const dueAt = input.dueInDays
    ? new Date(Date.now() + input.dueInDays * 86400000)
    : new Date(reservation.checkOut);
  
  const invoice = await prisma.invoice.create({
    data: {
      reference,
      reservationId: reservation.id,
      guestId: reservation.guestId,
      hotelId: input.hotelId,
      currency: 'EUR',
      subtotalCents,
      taxCents,
      totalCents,
      taxRate,
      status: 'DRAFT',
      dueAt,
      language: input.language ?? 'fr',
      notes: input.notes,
      internalNotes: input.internalNotes,
      lineItems: { create: lineItemsData },
    },
    include: {
      lineItems: true,
      payments: true,
      reservation: { include: { guest: true, room: true } },
      guest: true,
      hotel: true,
    },
  });
  
  return invoice;
}

/**
 * Émet la facture (passe de DRAFT à ISSUED, génère PDF, etc.)
 */
export async function issueInvoice(invoiceId: string, hotelId: string): Promise<InvoiceWithDetails> {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, hotelId },
  });
  if (!invoice) throw new Error('Facture introuvable');
  if (invoice.status !== 'DRAFT') {
    throw new Error(`Impossible d'émettre une facture en statut ${invoice.status}`);
  }
  
  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { status: 'ISSUED', issuedAt: new Date() },
    include: {
      lineItems: true,
      payments: true,
      reservation: { include: { guest: true, room: true } },
      guest: true,
      hotel: true,
    },
  });
  
  return updated;
}

/**
 * Crée un PaymentIntent Stripe pour payer la facture.
 */
export async function createPaymentIntent(invoiceId: string, hotelId: string, returnUrl: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, hotelId },
    include: { hotel: true, guest: true },
  });
  if (!invoice) throw new Error('Facture introuvable');
  if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
    throw new Error('Cette facture ne peut pas être payée');
  }
  
  const remainingCents = invoice.totalCents - invoice.paidCents;
  if (remainingCents <= 0) throw new Error('Facture déjà intégralement payée');
  
  // On crée une Checkout Session (plus simple que PaymentIntent direct)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: invoice.guest.email,
    line_items: [
      {
        price_data: {
          currency: invoice.currency.toLowerCase(),
          unit_amount: remainingCents,
          product_data: {
            name: `Facture ${invoice.reference}`,
            description: `${invoice.hotel.name} — ${invoice.guest.firstName} ${invoice.guest.lastName}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoiceId: invoice.id,
      hotelId,
      type: 'invoice_payment',
    },
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
    cancel_url: `${returnUrl}?status=cancelled`,
  });
  
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { stripeCheckoutSessionId: session.id },
  });
  
  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Enregistre un paiement manuel (hors Stripe).
 */
export async function recordManualPayment(
  invoiceId: string,
  hotelId: string,
  payment: {
    amountCents: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
  },
  userId: string
) {
  return await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id: invoiceId, hotelId },
    });
    if (!invoice) throw new Error('Facture introuvable');
    
    const newPaidCents = invoice.paidCents + payment.amountCents;
    const newStatus: InvoiceStatus =
      newPaidCents >= invoice.totalCents ? 'PAID' :
      newPaidCents > 0 ? 'PARTIALLY_PAID' :
      invoice.status;
    
    const [updatedInvoice, createdPayment] = await Promise.all([
      tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidCents: newPaidCents,
          status: newStatus,
          paidAt: newStatus === 'PAID' ? new Date() : null,
        },
      }),
      tx.payment.create({
        data: {
          invoiceId: invoice.id,
          hotelId,
          amountCents: payment.amountCents,
          method: payment.method,
          status: 'SUCCEEDED',
          reference: payment.reference,
          notes: payment.notes,
          recordedById: userId,
          paidAt: new Date(),
        },
      }),
    ]);
    
    return { invoice: updatedInvoice, payment: createdPayment };
  });
}

/**
 * Crée une facture d'acompte (Sprint 6C).
 */
export async function createDepositInvoice(reservationId: string, hotelId: string, depositCents: number) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, hotelId },
  });
  if (!reservation) throw new Error('Réservation introuvable');
  
  return createInvoiceFromReservation({
    reservationId,
    hotelId,
    customLineItems: [
      {
        description: 'Acompte réservation',
        quantity: 1,
        unitPriceCents: depositCents,
        category: 'DEPOSIT',
      },
    ],
    dueInDays: 7,
  });
}
