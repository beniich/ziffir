/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import cron from 'node-cron';
import { prisma } from '../infrastructure/database/prisma.client.js';
import type { HotelMetrics } from '../domains/analytics/metrics.service.js';
import { calculateMetrics } from '../domains/analytics/metrics.service.js';
import { subDays } from 'date-fns';

function generateWeeklyReportHTML(hotelName: string, metrics: HotelMetrics): string {
  const formatPercent = (v: number) => `${(v * 100).toFixed(1)}%`;
  const formatCurrency = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #D4AF37;">Rapport Hebdomadaire - ${hotelName}</h2>
      <p>Voici les performances de votre hôtel sur les 7 derniers jours :</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Taux d'occupation</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatPercent(metrics.occupancyRate)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>ADR (Prix moyen)</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(metrics.averageDailyRate)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>RevPAR</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(metrics.revenuePerAvailableRoom)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Revenu total</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(metrics.totalRevenue)}</td>
        </tr>
      </table>
      
      <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
        Pour plus de détails, connectez-vous au Dashboard Sapphire.
      </p>
    </div>
  `;
}

export function setupWeeklyReportJob() {
  // Tous les lundis à 8h
  cron.schedule('0 8 * * 1', async () => {
    console.log('📊 Envoi du rapport hebdomadaire…');
    try {
      const hotels = await prisma.hotel.findMany({ 
        where: { isActive: true } as any,
        include: { users: { where: { role: 'ADMIN', isActive: true } } },
      });
      
      for (const hotel of hotels) {
        const metrics = await calculateMetrics(hotel.id, subDays(new Date(), 7), new Date());
        
        const adminEmails = hotel.users.map(u => u.email);
        if (adminEmails.length === 0) continue;
        
        const html = generateWeeklyReportHTML(hotel.name, metrics);
        
        // Simuler l'envoi d'email
        console.log(`[EMAIL] To: ${adminEmails.join(', ')} | Subject: 📊 Rapport hebdomadaire — ${hotel.name}`);
        // await sendEmail({ to: adminEmails.join(', '), subject: ..., html });
      }
      console.log('✅ Rapports envoyés');
    } catch (e) {
      console.error('❌ Erreur lors du rapport hebdomadaire', e);
    }
  });
}
