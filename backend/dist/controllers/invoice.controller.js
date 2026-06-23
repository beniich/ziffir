"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const secure_prisma_1 = require("../services/secure-prisma");
class InvoiceController {
    /**
     * GET /api/invoices/me — Factures du client connecté
     */
    static async myInvoices(req, res) {
        try {
            const ctx = req.user;
            // Les room orders du client servent de factures (total, date, statut)
            const orders = await secure_prisma_1.securePrisma.roomOrder.findMany(ctx, {
                where: { status: 'DELIVERED' },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
            // Transformer en format facture
            const invoices = orders.map((o) => ({
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
        }
        catch (err) {
            const status = err.statusCode || 500;
            res.status(status).json({ success: false, error: err.message });
        }
    }
}
exports.InvoiceController = InvoiceController;
//# sourceMappingURL=invoice.controller.js.map