import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../infrastructure/database/prisma.client.js';
import { getTenantIdOrThrow } from '../shared/utils/tenant.js';
import { asyncHandler } from '../shared/errors/asyncHandler.js';
import { calculateMetrics } from '../domains/analytics/metrics.service.js';
import { subDays } from 'date-fns';

const rangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  preset: z.enum(['7d', '30d', '90d', 'ytd', '12m']).default('30d'),
});

function resolveRange(query: { from?: string; to?: string; preset?: string }): { from: Date; to: Date } {
  if (query.from && query.to) {
    return { from: new Date(query.from), to: new Date(query.to) };
  }
  const to = new Date();
  const preset = query.preset || '30d';
  let from: Date;
  switch (preset) {
    case '7d':  from = subDays(to, 7); break;
    case '30d': from = subDays(to, 30); break;
    case '90d': from = subDays(to, 90); break;
    case 'ytd': from = new Date(to.getFullYear(), 0, 1); break;
    case '12m': from = new Date(to.getFullYear() - 1, to.getMonth(), to.getDate()); break;
    default:    from = subDays(to, 30);
  }
  return { from, to };
}

export const getMetrics = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const { from, to, preset } = rangeSchema.parse(req.query);
  const range = resolveRange({ from, to, preset });
  
  const metrics = await calculateMetrics(hotelId, range.from, range.to);
  res.json(metrics);
});

/**
 * Forecast simple : moyenne mobile + saisonnalité
 */
export const getForecast = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const days = Number(req.query.days) || 30;
  
  // Historique 90 jours pour calculer la baseline
  const historical = await calculateMetrics(hotelId, subDays(new Date(), 90), new Date());
  
  // Calcul naïf : moyenne des 30 derniers jours + ajustement saisonnier
  const last30 = historical.daily.slice(-30);
  const avgOccupancy = last30.reduce((s, d) => s + d.occupancyRate, 0) / (last30.length || 1);
  const avgAdr = last30.reduce((s, d) => s + d.adr, 0) / (last30.length || 1);
  
  // Saisonnalité hebdo (jour de la semaine)
  const weekdayPatterns = new Map<number, number[]>();
  historical.daily.forEach(d => {
    const day = new Date(d.date).getDay();
    if (!weekdayPatterns.has(day)) weekdayPatterns.set(day, []);
    weekdayPatterns.get(day)!.push(d.occupancyRate);
  });
  const weekdayFactor = new Map<number, number>();
  weekdayPatterns.forEach((values, day) => {
    const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
    weekdayFactor.set(day, avgOccupancy > 0 ? avg / avgOccupancy : 1);
  });
  
  // Génération du forecast
  const forecast = [];
  const today = new Date();
  for (let i = 1; i <= days; i++) {
    const date = new Date(today.getTime() + i * 86400000);
    const dayOfWeek = date.getDay();
    const factor = weekdayFactor.get(dayOfWeek) ?? 1;
    
    // Petite variation aléatoire pour réalisme
    const noise = 0.95 + Math.random() * 0.1;
    const occupancy = Math.min(0.98, Math.max(0.10, avgOccupancy * factor * noise));
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      occupancyRate: occupancy,
      adr: avgAdr * (factor * 0.8 + 0.2),  // l'ADR suit partiellement l'occupancy
      revpar: avgAdr * occupancy,
      confidence: 0.7 - (i / days) * 0.3,  // moins confiant au loin
    });
  }
  
  res.json({
    historicalAverage: { occupancy: avgOccupancy, adr: avgAdr },
    forecast,
    methodology: 'moving_average_with_weekly_seasonality',
  });
});

/**
 * Pricing dynamique : suggère des prix par type de chambre et date
 * selon l'occupancy prévue et la saison.
 */
export const getPricingRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const hotelId = await getTenantIdOrThrow(req);
  const days = Number(req.query.days) || 30;
  
  const rooms = await prisma.room.findMany({ where: { hotelId } });
  const roomTypes = Array.from(new Set(rooms.map(r => r.type)));
  
  // Récupère les prix moyens par type
  const basePriceByType = new Map<string, number>();
  for (const type of roomTypes) {
    const typeRooms = rooms.filter(r => r.type === type);
    basePriceByType.set(type, typeRooms.reduce((s, r) => s + r.price, 0) / (typeRooms.length || 1));
  }
  
  // Pour chaque jour × type, on recommande un prix
  const today = new Date();
  const historical = await calculateMetrics(hotelId, subDays(today, 90), today);
  const last30 = historical.daily.slice(-30);
  const avgOccupancy = last30.reduce((s, d) => s + d.occupancyRate, 0) / (last30.length || 1);
  // avgAdr not needed in this function (used in forecast only)
  
  const weekdayFactor = new Map<number, number>();
  const weekdayPatterns = new Map<number, number[]>();
  historical.daily.forEach(d => {
    const day = new Date(d.date).getDay();
    if (!weekdayPatterns.has(day)) weekdayPatterns.set(day, []);
    weekdayPatterns.get(day)!.push(d.occupancyRate);
  });
  weekdayPatterns.forEach((values, day) => {
    const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
    weekdayFactor.set(day, avgOccupancy > 0 ? avg / avgOccupancy : 1);
  });
  
  const recommendations: Array<{
    date: string;
    roomType: string;
    basePrice: number;
    recommendedPrice: number;
    expectedOccupancy: number;
    priceChange: number;  // pourcentage
    reason: string;
  }> = [];
  
  for (let i = 1; i <= days; i++) {
    const date = new Date(today.getTime() + i * 86400000);
    const dayOfWeek = date.getDay();
    const factor = weekdayFactor.get(dayOfWeek) ?? 1;
    const projectedOccupancy = Math.min(0.98, avgOccupancy * factor);
    
    for (const [type, basePrice] of basePriceByType) {
      // Stratégie : elasticity
      let multiplier = 1;
      let reason = 'Prix de base';
      
      if (projectedOccupancy > 0.85) {
        multiplier = 1.25;
        reason = 'Forte demande prévue';
      } else if (projectedOccupancy > 0.70) {
        multiplier = 1.10;
        reason = 'Demande soutenue';
      } else if (projectedOccupancy < 0.30) {
        multiplier = 0.80;
        reason = 'Faible demande - stimulate';
      } else if (projectedOccupancy < 0.50) {
        multiplier = 0.92;
        reason = 'Demande modérée';
      }
      
      // Weekend : premium
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        multiplier *= 1.10;
        reason += ' + weekend';
      }
      
      const recommended = Math.round(basePrice * multiplier * 100) / 100;
      const change = ((recommended - basePrice) / basePrice) * 100;
      
      recommendations.push({
        date: date.toISOString().split('T')[0],
        roomType: type,
        basePrice,
        recommendedPrice: recommended,
        expectedOccupancy: projectedOccupancy,
        priceChange: change,
        reason,
      });
    }
  }
  
  res.json({ recommendations });
});
