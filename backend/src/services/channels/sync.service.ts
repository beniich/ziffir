import { prisma } from '../../infrastructure/database/prisma.client.js';
import { channelRegistry } from './registry.js';
import type { AvailabilityUpdate, ReservationFromOta } from './channel.interface.js';
import { addDays, startOfDay } from 'date-fns';

/**
 * Pousse les dispos + prix vers tous les canaux actifs d'un hôtel.
 */
export async function pushAvailabilityForHotel(
  hotelId: string,
  fromDate: Date = startOfDay(new Date()),
  daysToPush: number = 90
) {
  const channels = await prisma.channel.findMany({
    where: { hotelId, status: 'ACTIVE', autoPushAvailability: true },
    include: { hotel: true },
  });
  
  const results: Array<{ channelId: string; success: number; failed: number; error?: string }> = [];
  
  for (const channel of channels) {
    const connector = channelRegistry.get(channel.type);
    if (!connector) continue;
    
    const updates = await buildAvailabilityUpdates(hotelId, fromDate, daysToPush, channel);
    
    const syncLog = await prisma.channelSyncLog.create({
      data: {
        channelId: channel.id,
        hotelId,
        direction: 'PUSH',
        operation: 'AVAILABILITY_PUSH',
        status: 'IN_PROGRESS',
        fromDate,
        toDate: addDays(fromDate, daysToPush),
        itemsCount: updates.length,
      },
    });
    
    const start = Date.now();
    try {
      const res = await connector.pushAvailability(channel, updates);
      await prisma.channelSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: res.failed === 0 ? 'SUCCESS' : 'PARTIAL',
          successCount: res.success,
          failedCount: res.failed,
          completedAt: new Date(),
          duration: Date.now() - start,
          errorMessage: res.errors.length > 0 ? res.errors.join('; ') : null,
        },
      });
      await prisma.channel.update({
        where: { id: channel.id },
        data: {
          lastPushAt: new Date(),
          lastErrorAt: res.failed > 0 ? new Date() : null,
          lastErrorMessage: res.failed > 0 ? res.errors.join('; ') : null,
        },
      });
      results.push({ channelId: channel.id, success: res.success, failed: res.failed });
    } catch (e: any) {
      await prisma.channelSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          duration: Date.now() - start,
          errorMessage: e.message,
        },
      });
      await prisma.channel.update({
        where: { id: channel.id },
        data: { status: 'ERROR', lastErrorAt: new Date(), lastErrorMessage: e.message },
      });
      results.push({ channelId: channel.id, success: 0, failed: updates.length, error: e.message });
    }
  }
  
  return results;
}

/**
 * Construit la liste des dispos pour les N prochains jours.
 * Pour chaque jour × type de chambre : nombre de chambres dispo.
 */
async function buildAvailabilityUpdates(
  hotelId: string,
  fromDate: Date,
  days: number,
  channel: any
): Promise<AvailabilityUpdate[]> {
  const roomTypes = await prisma.room.groupBy({
    by: ['type'],
    where: { hotelId },
    _count: { id: true },
    _avg: { price: true },
  });
  
  const updates: AvailabilityUpdate[] = [];
  
  for (const rt of roomTypes) {
    for (let d = 0; d < days; d++) {
      const date = addDays(fromDate, d);
      const nextDay = addDays(date, 1);
      
      // Chambres de ce type
      const totalRooms = rt._count.id;
      
      // Réservations qui chevauchent ce jour pour ce type
      const occupiedCount = await prisma.reservation.count({
        where: {
          hotelId,
          room: { type: rt.type },
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          checkIn: { lt: nextDay },
          checkOut: { gt: date },
        },
      });
      
      // Tâches de ménage (chambres en CLEANING)
      const cleaningCount = await prisma.room.count({
        where: {
          hotelId,
          type: rt.type,
          status: 'CLEANING',
        },
      });
      
      const available = Math.max(0, totalRooms - occupiedCount - cleaningCount);
      const basePrice = rt._avg.price ?? 0;
      const markup = (channel.config?.markup as number) ?? 0;
      const finalPrice = Math.round(basePrice * (1 + markup) * 100) / 100;
      
      updates.push({
        roomType: rt.type,
        date,
        available,
        price: finalPrice,
        minLOS: (channel.config?.minLOS as number) ?? 1,
        maxLOS: (channel.config?.maxLOS as number) ?? 30,
      });
    }
  }
  
  return updates;
}

/**
 * Récupère les nouvelles réservations depuis tous les canaux.
 */
export async function pullReservationsForHotel(hotelId: string, since?: Date) {
  const channels = await prisma.channel.findMany({
    where: { hotelId, status: 'ACTIVE', autoPullReservations: true },
  });
  
  const sinceDate = since ?? addDays(new Date(), -7);  // par défaut : 7 jours en arrière
  const results: Array<{ channelId: string; pulled: number; imported: number; errors: string[] }> = [];
  
  for (const channel of channels) {
    const connector = channelRegistry.get(channel.type);
    if (!connector) continue;
    
    const syncLog = await prisma.channelSyncLog.create({
      data: {
        channelId: channel.id,
        hotelId,
        direction: 'PULL',
        operation: 'RESERVATION_PULL',
        status: 'IN_PROGRESS',
      },
    });
    
    const start = Date.now();
    try {
      const otaReservations = await connector.pullReservations(channel, sinceDate);
      let imported = 0;
      const errors: string[] = [];
      
      for (const otaRes of otaReservations) {
        try {
          await importOtaReservation(channel, otaRes);
          imported++;
        } catch (e: any) {
          errors.push(`${otaRes.externalId}: ${e.message}`);
        }
      }
      
      await prisma.channelSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
          itemsCount: otaReservations.length,
          successCount: imported,
          failedCount: errors.length,
          completedAt: new Date(),
          duration: Date.now() - start,
          errorMessage: errors.length > 0 ? errors.join('; ') : null,
        },
      });
      await prisma.channel.update({
        where: { id: channel.id },
        data: { lastPullAt: new Date() },
      });
      results.push({ channelId: channel.id, pulled: otaReservations.length, imported, errors });
    } catch (e: any) {
      await prisma.channelSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          duration: Date.now() - start,
          errorMessage: e.message,
        },
      });
      results.push({ channelId: channel.id, pulled: 0, imported: 0, errors: [e.message] });
    }
  }
  
  return results;
}

/**
 * Importe une résa OTA dans notre base comme une réservation normale.
 */
async function importOtaReservation(channel: any, otaRes: ReservationFromOta) {
  // Vérifier qu'on n'a pas déjà importé
  const existing = await prisma.channelReservation.findUnique({
    where: { channelId_externalId: { channelId: channel.id, externalId: otaRes.externalId } },
  });
  if (existing?.reservationId) return; // déjà importé
  
  // Trouver ou créer le guest (pas de contrainte unique hotelId+email)
  const [firstName, ...lastNameParts] = otaRes.guestName.split(' ');
  const lastName = lastNameParts.join(' ') || firstName;
  
  let guest = await prisma.guest.findFirst({
    where: { hotelId: channel.hotelId, email: otaRes.guestEmail },
  });
  if (!guest) {
    guest = await prisma.guest.create({
      data: {
        hotelId: channel.hotelId,
        firstName,
        lastName,
        email: otaRes.guestEmail,
        phone: otaRes.guestPhone,
      },
    });
  }
  
  // Trouver la chambre disponible (mapping ou recherche par type)
  const room = await findAvailableRoom(channel, otaRes);
  if (!room) {
    throw new Error(`Aucune chambre disponible ou existante pour le type de chambre ${otaRes.roomType}`);
  }

  const nights = Math.max(1, Math.ceil((otaRes.checkOut.getTime() - otaRes.checkIn.getTime()) / 86400000));
  const pricePerNight = Math.round((otaRes.totalPrice / nights) * 100) / 100;
  
  // Créer la résa
  const reservation = await prisma.reservation.create({
    data: {
      guestId: guest.id,
      roomId: room.id,
      checkIn: otaRes.checkIn,
      checkOut: otaRes.checkOut,
      nights,
      pricePerNight,
      totalPrice: otaRes.totalPrice,
      discount: 0,
      extras: 0,
      status: otaRes.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED',
      paymentStatus: 'PENDING',
      source: channel.type,
      hotelId: channel.hotelId,
      channelId: channel.id,
      externalReference: otaRes.externalId,
    },
  });
  
  // Lier la channel reservation
  await prisma.channelReservation.upsert({
    where: { channelId_externalId: { channelId: channel.id, externalId: otaRes.externalId } },
    update: {
      reservationId: reservation.id,
      importedAt: new Date(),
      status: otaRes.status,
    },
    create: {
      channelId: channel.id,
      hotelId: channel.hotelId,
      externalId: otaRes.externalId,
      guestName: otaRes.guestName,
      guestEmail: otaRes.guestEmail,
      guestPhone: otaRes.guestPhone,
      checkIn: otaRes.checkIn,
      checkOut: otaRes.checkOut,
      adults: otaRes.adults,
      children: otaRes.children,
      externalRoomId: otaRes.externalRoomId,
      roomType: otaRes.roomType,
      totalPrice: otaRes.totalPrice,
      currency: otaRes.currency,
      commissionPct: otaRes.commissionPct,
      status: otaRes.status,
      reservationId: reservation.id,
      importedAt: new Date(),
      rawData: otaRes.rawData,
    },
  });
}

async function findAvailableRoom(channel: any, otaRes: ReservationFromOta) {
  // Si on a un mapping, l'utiliser
  const mapping = (channel.roomMapping as Record<string, string>) ?? {};
  if (mapping[otaRes.roomType] === otaRes.externalRoomId) {
    const r = await prisma.room.findFirst({
      where: { hotelId: channel.hotelId, type: otaRes.roomType },
    });
    if (r) return r;
  }
  
  // Prendre n'importe quelle chambre libre du bon type
  const candidates = await prisma.room.findMany({
    where: { hotelId: channel.hotelId, type: otaRes.roomType },
  });
  
  for (const room of candidates) {
    const conflict = await prisma.reservation.findFirst({
      where: {
        roomId: room.id,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        checkIn: { lt: otaRes.checkOut },
        checkOut: { gt: otaRes.checkIn },
      },
    });
    if (!conflict) return room;
  }
  
  // Fallback : s'il n'y a pas de chambre sans conflit, retourner la première disponible de ce type
  if (candidates.length > 0) {
    return candidates[0];
  }
  
  // Fallback ultime : retourner n'importe quelle chambre de l'hôtel
  return prisma.room.findFirst({
    where: { hotelId: channel.hotelId },
  });
}

/**
 * Sync complète : push dispos + pull résas.
 */
export async function fullSyncHotel(hotelId: string) {
  const [pushResults, pullResults] = await Promise.all([
    pushAvailabilityForHotel(hotelId),
    pullReservationsForHotel(hotelId),
  ]);
  return { push: pushResults, pull: pullResults };
}
