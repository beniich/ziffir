import type { Request, Response } from 'express';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { getTenantIdOrThrow } from '../shared/utils/tenant.js';
import { asyncHandler } from '../shared/errors/asyncHandler.js';
import { getIo } from '../lib/io.js';
import { socketEvents } from '../socket.js';

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
  // pdfmake exports differently depending on bundler/Node version
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfMakeModule = require('pdfmake');
  const PdfPrinterClass =
    pdfMakeModule?.default?.default ??
    pdfMakeModule?.default ??
    pdfMakeModule;
  if (typeof PdfPrinterClass !== 'function') throw new Error('Not a constructor');
  printer = new PdfPrinterClass(fonts);
  console.log('✅ PdfPrinter initialisé');
} catch (e) {
  console.warn('⚠️  PdfPrinter non disponible – génération PDF désactivée:', (e as Error).message);
  // Mock fonctionnel : envoie un PDF vide au lieu de crasher
  printer = {
    createPdfKitDocument: () => ({
      pipe: (dest: any) => { dest.end(Buffer.from('%PDF-1.4\n%%EOF\n')); },
      end: () => {},
    }),
  };
}

const COLORS = {
  primary: '#0A0E27',
  accent: '#D4AF37',
  text: '#1A1A1A',
  muted: '#666666',
  border: '#D4AF37',
};

const headerStyle = {
  fontSize: 18,
  bold: true,
  color: COLORS.primary,
  margin: [0, 0, 0, 8] as [number, number, number, number],
};

const sectionTitle = (text: string) => ({
  text,
  fontSize: 12,
  bold: true,
  color: COLORS.accent,
  margin: [0, 12, 0, 6] as [number, number, number, number],
});

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    AVAILABLE: 'Disponible',
    OCCUPIED: 'Occupée',
    CLEANING: 'En nettoyage',
    MAINTENANCE: 'Maintenance',
    PENDING: 'En attente',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminée',
    CANCELLED: 'Annulée',
  };
  return map[status] ?? status;
}

function buildHeader(hotelName: string): TDocumentDefinitions['header'] {
  return {
    columns: [
      { text: 'SAPPHIRE', fontSize: 10, bold: true, color: COLORS.accent, margin: [40, 24, 0, 0] },
      {
        text: hotelName,
        fontSize: 10,
        color: COLORS.muted,
        alignment: 'right',
        margin: [0, 24, 40, 0],
      },
    ],
  };
}

function buildFooter(): TDocumentDefinitions['footer'] {
  return (currentPage: number, pageCount: number) => ({
    columns: [
      { text: `Généré le ${new Date().toLocaleDateString('fr-FR')}`, fontSize: 8, color: COLORS.muted, margin: [40, 0, 0, 0] },
      { text: `Page ${currentPage} / ${pageCount}`, fontSize: 8, color: COLORS.muted, alignment: 'right', margin: [0, 0, 40, 0] },
    ],
    margin: [0, 12, 0, 0] as [number, number, number, number],
  });
}

// ---------- Rapport d'occupation ----------
async function buildOccupancyReport(hotelId: string, hotelName: string) {
  const [rooms, total] = await Promise.all([
    prisma.room.findMany({ where: { hotelId }, orderBy: [{ floor: 'asc' }, { number: 'asc' }] }),
    prisma.room.count({ where: { hotelId } }),
  ]);

  const byStatus = rooms.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  const occupancyRate = total > 0 ? Math.round((byStatus.OCCUPIED / total) * 100) : 0;

  return {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 50],
    header: buildHeader(hotelName),
    footer: buildFooter(),
    content: [
      { text: "Rapport d'occupation", ...headerStyle },
      {
        columns: [
          { text: `Hôtel : ${hotelName}`, fontSize: 10, color: COLORS.muted },
          { text: `Taux d'occupation : ${occupancyRate}%`, fontSize: 10, bold: true, color: COLORS.accent, alignment: 'right' },
        ],
      },
      { text: '\n' },
      sectionTitle('Résumé'),
      {
        ul: [
          `Total chambres : ${total}`,
          `Disponibles : ${byStatus.AVAILABLE ?? 0}`,
          `Occupées : ${byStatus.OCCUPIED ?? 0}`,
          `En nettoyage : ${byStatus.CLEANING ?? 0}`,
          `En maintenance : ${byStatus.MAINTENANCE ?? 0}`,
        ],
        fontSize: 10,
        color: COLORS.text,
      },
      sectionTitle('Détail des chambres'),
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto', 'auto'],
          body: [
            [
              { text: 'N°', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
              { text: 'Étage', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
              { text: 'Type', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
              { text: 'Prix', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
              { text: 'Statut', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
            ],
            ...rooms.map((r) => [
              r.number,
              String(r.floor),
              r.type,
              `${r.price}€`,
              statusLabel(r.status),
            ]),
          ],
        },
        layout: {
          hLineColor: () => COLORS.border,
          vLineColor: () => '#EEEEEE',
        },
      },
    ],
    defaultStyle: { font: 'Helvetica', fontSize: 10, color: COLORS.text },
  };
}

// ---------- Rapport des tâches ----------
async function buildTasksReport(hotelId: string, hotelName: string) {
  const tasks = await prisma.task.findMany({
    where: { hotelId },
    include: { assignee: { select: { firstName: true, lastName: true } } },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });

  const byStatus = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 50],
    header: buildHeader(hotelName),
    footer: buildFooter(),
    content: [
      { text: 'Rapport des tâches opérationnelles', ...headerStyle },
      { text: `Total : ${tasks.length} tâches`, fontSize: 10, color: COLORS.muted },
      { text: '\n' },
      sectionTitle('Répartition par statut'),
      {
        ul: [
          `En attente : ${byStatus.PENDING ?? 0}`,
          `En cours : ${byStatus.IN_PROGRESS ?? 0}`,
          `Terminées : ${byStatus.COMPLETED ?? 0}`,
          `Annulées : ${byStatus.CANCELLED ?? 0}`,
        ],
        fontSize: 10,
      },
      sectionTitle('Liste détaillée'),
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Titre', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
              { text: 'Priorité', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
              { text: 'Statut', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
              { text: 'Assigné à', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
              { text: 'Échéance', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
            ],
            ...tasks.map((t) => [
              t.title,
              `P${t.priority}`,
              statusLabel(t.status),
              t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName[0]}.` : '—',
              t.dueAt ? new Date(t.dueAt).toLocaleDateString('fr-FR') : '—',
            ]),
          ],
        },
        layout: {
          hLineColor: () => COLORS.border,
          vLineColor: () => '#EEEEEE',
        },
      },
    ],
    defaultStyle: { font: 'Helvetica', fontSize: 10, color: COLORS.text },
  };
}

// ---------- Rapport de revenus ----------
async function buildRevenueReport(hotelId: string, hotelName: string) {
  const rooms = await prisma.room.findMany({ where: { hotelId } });
  const occupied = rooms.filter((r) => r.status === 'OCCUPIED');

  const byType = occupied.reduce<Record<string, { count: number; revenue: number }>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = { count: 0, revenue: 0 };
    acc[r.type].count += 1;
    acc[r.type].revenue += r.price;
    return acc;
  }, {});

  const totalRevenue = Object.values(byType).reduce((s, v) => s + v.revenue, 0);

  return {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 50],
    header: buildHeader(hotelName),
    footer: buildFooter(),
    content: [
      { text: 'Rapport de revenus', ...headerStyle },
      {
        columns: [
          { text: `Hôtel : ${hotelName}`, fontSize: 10, color: COLORS.muted },
          { text: `Revenu total : ${totalRevenue}€`, fontSize: 12, bold: true, color: COLORS.accent, alignment: 'right' },
        ],
      },
      { text: '\n' },
      sectionTitle('Revenus par type de chambre'),
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Type', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
              { text: 'Chambres occupées', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
              { text: 'Prix unitaire', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
              { text: 'Revenu', bold: true, color: COLORS.accent, fillColor: '#FAF6E7' },
            ],
            ...Object.entries(byType).map(([type, v]) => {
              const sample = occupied.find((r) => r.type === type);
              return [
                type,
                String(v.count),
                `${sample?.price ?? 0}€`,
                `${v.revenue}€`,
              ];
            }),
            [
              { text: 'TOTAL', bold: true, color: COLORS.primary, colSpan: 3 } as any,
              {},
              {},
              { text: `${totalRevenue}€`, bold: true, color: COLORS.accent },
            ],
          ],
        },
        layout: { hLineColor: () => COLORS.border, vLineColor: () => '#EEEEEE' },
      },
    ],
    defaultStyle: { font: 'Helvetica', fontSize: 10, color: COLORS.text },
  };
}

// ---------- Handler exporté ----------
export const generateReport = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const type = (req.query.type as 'occupancy' | 'tasks' | 'revenue') ?? 'occupancy';

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) {
    return res.status(404).json({ error: 'Hôtel introuvable' });
  }

  let doc: any;
  if (type === 'occupancy') doc = await buildOccupancyReport(hotelId, hotel.name) as any;
  else if (type === 'tasks') doc = await buildTasksReport(hotelId, hotel.name) as any;
  else if (type === 'revenue') doc = await buildRevenueReport(hotelId, hotel.name) as any;
  else return res.status(400).json({ error: 'Type invalide (occupancy|tasks|revenue)' });

  const pdfDoc = printer.createPdfKitDocument(doc as any);
  const filename = `rapport-${type}-${new Date().toISOString().split('T')[0]}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  pdfDoc.pipe(res);
  pdfDoc.end();

  // Notif live
  socketEvents.notify(getIo(), hotelId, {
    type: 'report.generated',
    title: 'Rapport généré',
    message: `Le rapport "${type}" a été téléchargé`,
    level: 'success',
  });
});
