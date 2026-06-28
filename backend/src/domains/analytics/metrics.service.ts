/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { startOfDay, endOfDay, subDays, differenceInDays, eachDayOfInterval, format } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';

export type HotelMetrics = {
  from: Date;
  to: Date;
  days: number;
  totalRooms: number;
  availableRoomNights: number;
  occupiedRoomNights: number;
  occupancyRate: number;
  totalRevenue: number;
  averageDailyRate: number;
  revenuePerAvailableRoom: number;
  occupancyRateChange: number;
  adrChange: number;
  revparChange: number;
  daily: Array<{
    date: string;
    occupancyRate: number;
    adr: number;
    revpar: number;
    revenue: number;
  }>;
  byRoomType: Array<{
    type: string;
    revpar: number;
    adr: number;
    occupancyRate: number;
    revenue: number;
  }>;
  bySource: Array<{
    source: string;
    revenue: number;
    percentage: number;
    count: number;
  }>;
};

export async function calculateMetrics(
  hotelId: string,
  from: Date,
  to: Date
): Promise<HotelMetrics> {
  const days = differenceInDays(to, from) + 1;
  const today = startOfDay(new Date());
  const effectiveTo = to > today ? today : to;
  
  const totalRooms = await prisma.room.count({ where: { hotelId } });
  const availableRoomNights = totalRooms * days;
  
  const reservations = await prisma.reservation.findMany({
    where: {
      hotelId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      checkIn: { lt: to },
      checkOut: { gt: from },
    },
    include: { room: true },
  });
  
  const dailyMap = new Map<string, { revenue: number; occupiedNights: number }>();
  const dailyDates = eachDayOfInterval({ start: from, end: effectiveTo });
  for (const d of dailyDates) {
    dailyMap.set(format(d, 'yyyy-MM-dd'), { revenue: 0, occupiedNights: 0 });
  }
  
  let totalRevenue = 0;
  let totalOccupiedNights = 0;
  
  for (const resa of reservations) {
    const nightsCount = differenceInDays(resa.checkOut, resa.checkIn);
    const revenuePerNight = resa.totalPrice / Math.max(1, nightsCount);
    
    for (let i = 0; i < nightsCount; i++) {
      const nightDate = new Date(resa.checkIn.getTime() + i * 86400000);
      if (nightDate < from || nightDate > to) continue;
      if (nightDate > today) continue;
      
      const key = format(nightDate, 'yyyy-MM-dd');
      const entry = dailyMap.get(key);
      if (entry) {
        entry.revenue += revenuePerNight;
        entry.occupiedNights += 1;
      }
      totalRevenue += revenuePerNight;
      totalOccupiedNights += 1;
    }
  }
  
  const daily = Array.from(dailyMap.entries()).map(([date, v]) => ({
    date,
    occupancyRate: totalRooms > 0 ? v.occupiedNights / totalRooms : 0,
    adr: v.occupiedNights > 0 ? v.revenue / v.occupiedNights : 0,
    revpar: totalRooms > 0 ? v.revenue / totalRooms : 0,
    revenue: v.revenue,
  }));
  
  const averageDailyRate = totalOccupiedNights > 0 ? totalRevenue / totalOccupiedNights : 0;
  const revenuePerAvailableRoom = availableRoomNights > 0 ? totalRevenue / availableRoomNights : 0;
  const occupancyRate = availableRoomNights > 0 ? totalOccupiedNights / availableRoomNights : 0;
  
  const previousFrom = subDays(from, days);
  const previousTo = subDays(from, 1);
  const previousMetrics = await calculateQuickMetrics(hotelId, previousFrom, previousTo);
  
  const occupancyRateChange = previousMetrics.occupancyRate > 0
    ? (occupancyRate - previousMetrics.occupancyRate) / previousMetrics.occupancyRate
    : 0;
  const adrChange = previousMetrics.adr > 0
    ? (averageDailyRate - previousMetrics.adr) / previousMetrics.adr
    : 0;
  const revparChange = previousMetrics.revpar > 0
    ? (revenuePerAvailableRoom - previousMetrics.revpar) / previousMetrics.revpar
    : 0;
  
  const byRoomTypeMap = new Map<string, { revenue: number; nights: number; revpar: number }>();
  for (const resa of reservations) {
    const type = resa.room.type;
    if (!byRoomTypeMap.has(type)) byRoomTypeMap.set(type, { revenue: 0, nights: 0, revpar: 0 });
    const entry = byRoomTypeMap.get(type)!;
    entry.revenue += resa.totalPrice;
    entry.nights += resa.nights;
  }
  
  const roomTypeCounts = await prisma.room.groupBy({
    by: ['type'],
    where: { hotelId },
    _count: { id: true },
  });
  const roomCountByType = new Map(roomTypeCounts.map(r => [r.type, r._count.id]));
  
  const byRoomType = Array.from(byRoomTypeMap.entries()).map(([type, v]) => ({
    type,
    revpar: days > 0 ? v.revenue / ((roomCountByType.get(type) ?? 0) * days) : 0,
    adr: v.nights > 0 ? v.revenue / v.nights : 0,
    occupancyRate: v.nights > 0 && (roomCountByType.get(type) ?? 0) * days > 0
      ? v.nights / ((roomCountByType.get(type) ?? 0) * days)
      : 0,
    revenue: v.revenue,
  }));
  
  const bySourceMap = new Map<string, { revenue: number; count: number }>();
  for (const resa of reservations) {
    const source = resa.source || 'DIRECT';
    if (!bySourceMap.has(source)) bySourceMap.set(source, { revenue: 0, count: 0 });
    const entry = bySourceMap.get(source)!;
    entry.revenue += resa.totalPrice;
    entry.count += 1;
  }
  const totalResaRevenue = Array.from(bySourceMap.values()).reduce((s, v) => s + v.revenue, 0);
  const bySource = Array.from(bySourceMap.entries()).map(([source, v]) => ({
    source,
    revenue: v.revenue,
    percentage: totalResaRevenue > 0 ? v.revenue / totalResaRevenue : 0,
    count: v.count,
  })).sort((a, b) => b.revenue - a.revenue);
  
  return {
    from, to, days,
    totalRooms,
    availableRoomNights,
    occupiedRoomNights: totalOccupiedNights,
    occupancyRate,
    totalRevenue,
    averageDailyRate,
    revenuePerAvailableRoom,
    occupancyRateChange,
    adrChange,
    revparChange,
    daily,
    byRoomType,
    bySource,
  };
}

async function calculateQuickMetrics(hotelId: string, from: Date, to: Date) {
  const totalRooms = await prisma.room.count({ where: { hotelId } });
  const days = differenceInDays(to, from) + 1;
  const availableRoomNights = totalRooms * days;
  
  const reservations = await prisma.reservation.findMany({
    where: {
      hotelId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      checkIn: { lt: to },
      checkOut: { gt: from },
    },
    select: { totalPrice: true, checkIn: true, checkOut: true },
  });
  
  let totalRevenue = 0;
  let totalNights = 0;
  for (const r of reservations) {
    const nightsCount = differenceInDays(r.checkOut, r.checkIn);
    const startNight = r.checkIn < from ? from : r.checkIn;
    const endNight = r.checkOut > to ? to : r.checkOut;
    const effectiveNights = Math.max(0, differenceInDays(endNight, startNight));
    if (effectiveNights === 0) continue;
    const pricePerNight = r.totalPrice / Math.max(1, nightsCount);
    totalRevenue += pricePerNight * effectiveNights;
    totalNights += effectiveNights;
  }
  
  return {
    occupancyRate: availableRoomNights > 0 ? totalNights / availableRoomNights : 0,
    adr: totalNights > 0 ? totalRevenue / totalNights : 0,
    revpar: availableRoomNights > 0 ? totalRevenue / availableRoomNights : 0,
  };
}
