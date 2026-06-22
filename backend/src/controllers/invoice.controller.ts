import { Request, Response } from 'express';
import { securePrisma } from '../services/secure-prisma';
import { UserContext } from '../services/permissions.service';

export class InvoiceController {
  /**
   * GET /api/invoices/me — Factures du client connecté
   */
  static async myInvoices(req: Request, res: Response): Promise<void> {
    try {
      const ctx = (req as any).user as UserContext;

      // Les room orders du client servent de factures (total, date, statut)
      const orders = await securePrisma.roomOrder.findMany(ctx, {
        where: { status: 'DELIVERED' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      // Transformer en format facture
      const invoices = orders.map((o: any) => ({
        id: o.id,
        orderRef: o.orderRef,
        roomNumber: o.roomNumber,
        total: o.total,
        vat: o.vat,
        serviceCharge: o.serviceCharge,
        subtotal: o.subtotal,
        status: 'PAID',
        createdAt: o.createdAt,
      }));

      res.json({ success: true, data: invoices });
    } catch (err: any) {
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }
}
