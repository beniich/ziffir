import { prisma } from '../infrastructure/database/prisma.client.js';

/**
 * Génère une référence humaine unique : PREFIX-YYYY-NNNN
 * Supporte : INV, PAY, RES
 */
export async function generateReference(
  hotelId: string,
  prefix: 'INV' | 'PAY' | 'RES',
  model: 'invoice' | 'payment' | 'reservation'
): Promise<string> {
  const year = new Date().getFullYear();
  const startOfYear = new Date(`${year}-01-01`);
  
  let count = 0;
  if (model === 'invoice') {
    count = await prisma.invoice.count({
      where: { hotelId, createdAt: { gte: startOfYear } },
    });
  } else if (model === 'payment') {
    count = await prisma.payment.count({
      where: { hotelId, createdAt: { gte: startOfYear } },
    });
  } else if (model === 'reservation') {
    count = await prisma.reservation.count({
      where: { hotelId, createdAt: { gte: startOfYear } },
    });
  }
  
  return `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
}

// Raccourci
export const generateInvoiceReference = (hotelId: string) => generateReference(hotelId, 'INV', 'invoice');
