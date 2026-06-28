/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../../infrastructure/database/prisma.client.js';
import { asyncHandler } from '../../../shared/errors/asyncHandler.js';
import { ApiError } from '../../../shared/errors/errorHandler.js';
import {
  parsePagination,
  buildPaginatedResponse,
  prismaSkipTake,
} from '../../../shared/utils/pagination.js';
import { resolveHotelScope } from '../../identity/auth/auth.middleware.js';
import {
  createInvoiceFromReservation,
  issueInvoice,
  recordManualPayment,
  createPaymentIntent,
} from './invoice.service.js';
import { generateInvoicePDF } from '../../../services/pdf-invoice.service.js';
import { queueWebhook } from '../../../infrastructure/webhooks/webhook-dispatcher.service.js';
import { Prisma, InvoiceStatus, PaymentMethod } from '@prisma/client';

const createSchema = z.object({
  reservationId: z.string().cuid(),
  customLineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().int().min(1).default(1),
    unitPriceCents: z.number().int().positive(),
    taxRate: z.number().min(0).max(1).optional(),
    category: z.string().optional(),
  })).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  dueInDays: z.number().int().min(0).optional(),
  language: z.enum(['fr', 'en']).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

const listSchema = z.object({
  status: z.enum(['DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']).optional(),
  guestId: z.string().cuid().optional(),
}).merge(z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}));

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  
  const { status, guestId, ...paginationRaw } = listSchema.parse(req.query);
  const pagination = paginationRaw as { page: number; pageSize: number };
  
  const where = {
    hotelId,
    ...(status && { status }),
    ...(guestId && { guestId }),
  };
  
  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        guest: { select: { id: true, firstName: true, lastName: true, email: true } },
        reservation: { select: { id: true, checkIn: true, checkOut: true } },
        _count: { select: { lineItems: true, payments: true } },
      },
      orderBy: { createdAt: 'desc' },
      ...prismaSkipTake(pagination),
    }),
    prisma.invoice.count({ where }),
  ]);
  
  res.json(buildPaginatedResponse(invoices, total, pagination));
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  
  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id, hotelId },
    include: {
      lineItems: { orderBy: { position: 'asc' } },
      payments: { orderBy: { paidAt: 'desc' } },
      guest: true,
      hotel: true,
      reservation: { include: { room: true } },
    },
  });
  if (!invoice) throw new ApiError(404, 'Facture introuvable');
  res.json({ invoice });
});

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  
  const data = createSchema.parse(req.body);
  
  try {
    const invoice = await createInvoiceFromReservation({ ...data, hotelId } as any);
    
    // We mock the audit function or skip if it's not defined
    if ('audit' in req && typeof (req as any).audit === 'function') {
      await (req as any).audit({
        action: 'CREATE',
        resource: 'Invoice',
        resourceId: invoice.id,
        after: invoice,
      });
    }

    queueWebhook(hotelId, 'invoice.created', { invoice });
    
    res.status(201).json({ invoice });
  } catch (e: any) {
    if (e.message === 'Réservation introuvable') throw new ApiError(404, e.message);
    if (e.message.includes('annulée')) throw new ApiError(400, e.message);
    if (e.message.includes('existe déjà')) throw new ApiError(409, e.message);
    throw e;
  }
});

export const issueInvoiceHandler = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  
  const invoice = await issueInvoice(req.params.id, hotelId);
  
  if ('audit' in req && typeof (req as any).audit === 'function') {
    await (req as any).audit({
      action: 'UPDATE',
      resource: 'Invoice',
      resourceId: invoice.id,
      metadata: { action: 'issue' },
    });
  }

  queueWebhook(hotelId, 'invoice.issued', { invoice });
  
  res.json({ invoice });
});

export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  
  const returnUrl = `${req.protocol}://${req.get('host')}/api/invoices/${req.params.id}/payment-callback`;
  
  const session = await createPaymentIntent(req.params.id, hotelId, returnUrl);
  res.json(session);
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  
  const data = z.object({
    amountCents: z.number().int().positive(),
    method: z.enum(['CARD', 'BANK_TRANSFER', 'CASH', 'CHECK', 'OTHER']),
    reference: z.string().optional(),
    notes: z.string().optional(),
  }).parse(req.body);
  
  const { invoice, payment } = await recordManualPayment(
    req.params.id,
    hotelId,
    data as any,
    req.user!.userId
  );
  
  if ('audit' in req && typeof (req as any).audit === 'function') {
    await (req as any).audit({
      action: 'CREATE',
      resource: 'Invoice',
      resourceId: invoice.id,
      after: { payment, newStatus: invoice.status, paidCents: invoice.paidCents },
      metadata: { action: 'payment_recorded' },
    });
  }

  if (invoice.status === 'PAID') {
    queueWebhook(hotelId, 'invoice.paid', { invoice, payment });
  }
  
  res.status(201).json({ invoice, payment });
});

export const downloadInvoicePDF = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = resolveHotelScope(req);
  if (!hotelId) throw new ApiError(400, 'hotelId requis');
  
  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id, hotelId },
    include: {
      lineItems: { orderBy: { position: 'asc' } },
      payments: { orderBy: { paidAt: 'desc' } },
      guest: true,
      hotel: true,
      reservation: { include: { room: true } },
    },
  });
  if (!invoice) throw new ApiError(404, 'Facture introuvable');
  
  const pdfBuffer = await generateInvoicePDF(invoice as any);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${invoice.reference}.pdf"`);
  res.send(pdfBuffer);
});
