import type { TDocumentDefinitions, Margins, TableCell } from 'pdfmake/interfaces';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

let printer: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfMakeModule = require('pdfmake');
  const PdfPrinterClass =
    pdfMakeModule?.default?.default ??
    pdfMakeModule?.default ??
    pdfMakeModule;
  if (typeof PdfPrinterClass !== 'function') throw new Error('Not a constructor');
  printer = new PdfPrinterClass(fonts);
  console.log('✅ PdfPrinter (invoice) initialisé');
} catch (e) {
  console.warn('⚠️  PdfPrinter (invoice) non disponible:', (e as Error).message);
  printer = {
    createPdfKitDocument: () => ({
      on: (_: any, cb?: () => void) => { if (_ === 'end' && cb) setTimeout(cb, 0); },
      end: () => {},
    }),
  };
}

const COLORS = {
  primary: '#0A0E27',
  accent: '#D4AF37',
  text: '#1A1A1A',
  muted: '#666666',
  lightGray: '#F5F5F5',
  border: '#D4AF37',
};

function formatCents(cents: number, currency: string, locale: 'fr' | 'en' = 'fr'): string {
  const value = cents / 100;
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

function statusLabel(status: string, locale: 'fr' | 'en'): string {
  const fr: Record<string, string> = {
    DRAFT: 'Brouillon', ISSUED: 'Émise', PAID: 'Payée',
    PARTIALLY_PAID: 'Partiellement payée', OVERDUE: 'En retard',
    CANCELLED: 'Annulée', REFUNDED: 'Remboursée',
  };
  const en: Record<string, string> = {
    DRAFT: 'Draft', ISSUED: 'Issued', PAID: 'Paid',
    PARTIALLY_PAID: 'Partially paid', OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled', REFUNDED: 'Refunded',
  };
  return locale === 'fr' ? (fr[status] ?? status) : (en[status] ?? status);
}

export async function generateInvoicePDF(invoice: any): Promise<Buffer> {
  const locale = invoice.language === 'en' ? 'en' : 'fr';
  const t = locale === 'fr' ? {
    invoice: 'FACTURE',
    billTo: 'Facturé à',
    stay: 'Séjour',
    ref: 'Référence',
    dates: 'Dates',
    nights: 'Nuits',
    description: 'Description',
    quantity: 'Qté',
    unitPrice: 'Prix unit.',
    tax: 'TVA',
    total: 'Total',
    subtotal: 'Sous-total HT',
    taxAmount: 'TVA',
    totalTTC: 'Total TTC',
    paid: 'Déjà payé',
    remaining: 'Reste à payer',
    issueDate: 'Date d\'émission',
    dueDate: 'Échéance',
    paymentHistory: 'Historique paiements',
    method: 'Méthode',
    date: 'Date',
    notes: 'Notes',
  } : {
    invoice: 'INVOICE',
    billTo: 'Billed to',
    stay: 'Stay',
    ref: 'Reference',
    dates: 'Dates',
    nights: 'Nights',
    description: 'Description',
    quantity: 'Qty',
    unitPrice: 'Unit price',
    tax: 'Tax',
    total: 'Total',
    subtotal: 'Subtotal',
    taxAmount: 'Tax',
    totalTTC: 'Total',
    paid: 'Already paid',
    remaining: 'Remaining',
    issueDate: 'Issue date',
    dueDate: 'Due date',
    paymentHistory: 'Payment history',
    method: 'Method',
    date: 'Date',
    notes: 'Notes',
  };
  
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 100, 40, 60],
    header: {
      margin: [40, 30, 40, 0],
      columns: [
        {
          stack: [
            { text: invoice.hotel.name.toUpperCase(), fontSize: 18, bold: true, color: COLORS.accent },
            { text: invoice.hotel.address, fontSize: 9, color: COLORS.muted, margin: [0, 2, 0, 0] },
            { text: `${invoice.hotel.city}, ${invoice.hotel.country}`, fontSize: 9, color: COLORS.muted },
            { text: '⭐'.repeat(invoice.hotel.stars), fontSize: 9, color: COLORS.accent, margin: [0, 2, 0, 0] },
          ],
        },
        {
          stack: [
            { text: t.invoice, fontSize: 28, bold: true, color: COLORS.primary, alignment: 'right' },
            { text: invoice.reference, fontSize: 11, color: COLORS.accent, alignment: 'right', margin: [0, 4, 0, 0] },
            {
              text: statusLabel(invoice.status, locale),
              fontSize: 10,
              color: invoice.status === 'PAID' ? '#10B981' : invoice.status === 'OVERDUE' ? '#EF4444' : COLORS.muted,
              alignment: 'right',
              margin: [0, 4, 0, 0],
            },
          ],
        },
      ],
    },
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: invoice.reference, fontSize: 8, color: COLORS.muted, margin: [40, 0, 0, 0] },
        { text: `${currentPage} / ${pageCount}`, fontSize: 8, color: COLORS.muted, alignment: 'right', margin: [0, 0, 40, 0] },
      ],
    }),
    content: [
      // Dates + Bill to
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: `${t.issueDate} : ${format(invoice.issuedAt ?? invoice.createdAt, 'dd MMMM yyyy', { locale: locale === 'fr' ? fr : enUS })}`, fontSize: 9, color: COLORS.muted },
              { text: `${t.dueDate} : ${invoice.dueAt ? format(invoice.dueAt, 'dd MMMM yyyy', { locale: locale === 'fr' ? fr : enUS }) : '—'}`, fontSize: 9, color: COLORS.muted, margin: [0, 2, 0, 0] },
            ],
          },
          {
            width: '50%',
            stack: [
              { text: t.billTo.toUpperCase(), fontSize: 8, color: COLORS.accent, bold: true },
              { text: `${invoice.guest.firstName} ${invoice.guest.lastName}`, fontSize: 11, bold: true, margin: [0, 4, 0, 0] },
              { text: invoice.guest.email, fontSize: 9, color: COLORS.muted },
              ...(invoice.guest.phone ? [{ text: invoice.guest.phone, fontSize: 9, color: COLORS.muted }] : []),
              ...(invoice.guest.address ? [{ text: invoice.guest.address, fontSize: 9, color: COLORS.muted }] : []),
            ],
          },
        ],
        margin: [0, 0, 0, 20] as [number, number, number, number],
      },
      
      // Stay summary card
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: t.ref, ...labelStyle() },
              { text: t.dates, ...labelStyle() },
              { text: t.nights, ...labelStyle() },
              { text: 'Chambre', ...labelStyle() },
            ],
            [
              { text: invoice.reservation.reference, fontSize: 10, bold: true },
              { 
                text: `${format(new Date(invoice.reservation.checkIn), 'dd MMM', { locale: locale === 'fr' ? fr : enUS })} → ${format(new Date(invoice.reservation.checkOut), 'dd MMM yyyy', { locale: locale === 'fr' ? fr : enUS })}`,
                fontSize: 10,
              },
              { text: String(invoice.reservation.nights), fontSize: 10 },
              { text: invoice.reservation.room?.number ?? invoice.reservation.roomType, fontSize: 10 },
            ],
          ],
        },
        layout: tableLayout(),
      },
      
      // Spacer
      { text: '', margin: [0, 0, 0, 20] },
      
      // Line items
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: t.description, ...headerStyle() },
              { text: t.quantity, ...headerStyle(), alignment: 'center' },
              { text: t.unitPrice, ...headerStyle(), alignment: 'right' },
              { text: t.tax, ...headerStyle(), alignment: 'right' },
              { text: t.total, ...headerStyle(), alignment: 'right' },
            ],
            ...invoice.lineItems.map((li: any, idx: number) => [
              { text: li.description, fontSize: 9, fillColor: idx % 2 === 1 ? COLORS.lightGray : undefined },
              { text: String(li.quantity), fontSize: 9, alignment: 'center', fillColor: idx % 2 === 1 ? COLORS.lightGray : undefined },
              { text: formatCents(li.unitPriceCents, invoice.currency, locale), fontSize: 9, alignment: 'right', fillColor: idx % 2 === 1 ? COLORS.lightGray : undefined },
              { text: `${(li.taxRate * 100).toFixed(0)}%`, fontSize: 9, alignment: 'right', fillColor: idx % 2 === 1 ? COLORS.lightGray : undefined },
              { text: formatCents(li.totalCents, invoice.currency, locale), fontSize: 9, alignment: 'right', bold: true, fillColor: idx % 2 === 1 ? COLORS.lightGray : undefined },
            ]),
          ],
        },
        layout: tableLayout(),
      },
      
      // Totals
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            margin: [0, 16, 0, 0] as Margins,
            table: {
              widths: ['auto', 'auto'],
              body: [
                [
                  { text: t.subtotal, fontSize: 9, color: COLORS.muted, alignment: 'right' } as TableCell,
                  { text: formatCents(invoice.subtotalCents, invoice.currency, locale), fontSize: 9, alignment: 'right' } as TableCell,
                ],
                [
                  { text: `${t.taxAmount} (${(invoice.taxRate * 100).toFixed(0)}%)`, fontSize: 9, color: COLORS.muted, alignment: 'right' } as TableCell,
                  { text: formatCents(invoice.taxCents, invoice.currency, locale), fontSize: 9, alignment: 'right' } as TableCell,
                ],
                [
                  { text: t.totalTTC, fontSize: 11, bold: true, color: COLORS.primary, alignment: 'right', fillColor: '#FAF6E7' } as TableCell,
                  { text: formatCents(invoice.totalCents, invoice.currency, locale), fontSize: 12, bold: true, color: COLORS.accent, alignment: 'right', fillColor: '#FAF6E7' } as TableCell,
                ],
                ...(invoice.paidCents > 0 ? [
                  [
                    { text: t.paid, fontSize: 9, color: '#10B981', alignment: 'right' } as TableCell,
                    { text: formatCents(invoice.paidCents, invoice.currency, locale), fontSize: 9, color: '#10B981', alignment: 'right' } as TableCell,
                  ],
                  [
                    { text: t.remaining, fontSize: 10, bold: true, alignment: 'right' } as TableCell,
                    { text: formatCents(invoice.totalCents - invoice.paidCents, invoice.currency, locale), fontSize: 11, bold: true, color: invoice.totalCents - invoice.paidCents > 0 ? COLORS.primary : '#10B981', alignment: 'right' } as TableCell,
                  ],
                ] : []),
              ],
            },
            layout: 'noBorders',
          },
        ] as any,
      },
      
      // Payment history
      ...(invoice.payments.length > 0 ? [
        { text: t.paymentHistory, fontSize: 11, bold: true, color: COLORS.primary, margin: [0, 24, 0, 8] as Margins },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto'],
            body: [
              [
                { text: t.method, ...headerStyle() },
                { text: t.date, ...headerStyle() },
                { text: t.total, ...headerStyle(), alignment: 'right' },
              ],
              ...invoice.payments.map((p: any) => [
                { text: paymentMethodLabel(p.method, locale), fontSize: 9 },
                { text: p.paidAt ? format(new Date(p.paidAt), 'dd MMM yyyy', { locale: locale === 'fr' ? fr : enUS }) : '—', fontSize: 9 },
                { text: formatCents(p.amountCents, invoice.currency, locale), fontSize: 9, alignment: 'right' },
              ]),
            ],
          },
          layout: tableLayout(),
        },
      ] : []),
      
      // Notes
      ...(invoice.notes ? [
        { text: t.notes, fontSize: 11, bold: true, color: COLORS.primary, margin: [0, 24, 0, 8] as Margins },
        { text: invoice.notes, fontSize: 9, color: COLORS.text, lineHeight: 1.4 },
      ] : []),
    ],
    defaultStyle: { font: 'Helvetica', fontSize: 10, color: COLORS.text },
  };
  
  return new Promise((resolve) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.end();
  });
}

function labelStyle() {
  return { fontSize: 8, color: COLORS.muted, bold: true };
}

function headerStyle() {
  return { 
    fontSize: 9, 
    bold: true, 
    color: COLORS.accent, 
    fillColor: '#FAF6E7',
  };
}

function tableLayout() {
  return {
    hLineColor: () => COLORS.border + '33',
    vLineColor: () => COLORS.border + '33',
  };
}

function paymentMethodLabel(method: string, locale: 'fr' | 'en'): string {
  const labels: Record<string, Record<string, string>> = {
    CARD: { fr: 'Carte bancaire', en: 'Credit card' },
    BANK_TRANSFER: { fr: 'Virement', en: 'Bank transfer' },
    CASH: { fr: 'Espèces', en: 'Cash' },
    CHECK: { fr: 'Chèque', en: 'Check' },
    OTHER: { fr: 'Autre', en: 'Other' },
  };
  return labels[method]?.[locale] ?? method;
}
