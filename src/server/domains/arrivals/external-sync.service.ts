// src/server/domains/arrivals/external-sync.service.ts
// ============================================================================
// Synchronisation avec sources externes : vols, chauffeurs, météo
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { getRealtimeServer } from '../../realtime/socketServer.js';
import { auditService } from '../shared/services/audit.service.js';

const prisma = new PrismaClient();

interface FlightUpdatePayload {
  flightNumber: string;
  status: 'ON_TIME' | 'DELAYED' | 'LANDED' | 'CANCELLED';
  estimatedArrival?: string;
  actualArrival?: string;
  gate?: string;
  terminal?: string;
}

interface DriverUpdatePayload {
  arrivalId: string;
  latitude: number;
  longitude: number;
  etaMinutes: number;
  status: 'EN_ROUTE' | 'AT_LOCATION' | 'STUCK';
}

class ExternalSyncService {

  async processFlightUpdate(payload: FlightUpdatePayload, hotelId: string): Promise<void> {
    const arrival = await prisma.arrival.findFirst({
      where: {
        hotelId,
        flightNumber: payload.flightNumber,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'EN_ROUTE'] },
      },
    });

    if (!arrival) {
      console.log(`[flight-sync] No active arrival for flight ${payload.flightNumber}`);
      return;
    }

    const newEta = payload.estimatedArrival
      ? new Date(payload.estimatedArrival)
      : arrival.flightEta;

    // Persister l'update externe
    await prisma.externalUpdate.create({
      data: {
        arrivalId: arrival.id,
        source: 'flight_tracking',
        updateType: payload.status,
        payload: JSON.stringify(payload),
        processedAt: new Date(),
      },
    });

    let newStatus = arrival.status;

    if (payload.status === 'DELAYED' && newEta) {
      const delayMin = (newEta.getTime() - arrival.scheduledArrivalAt.getTime()) / 60000;
      if (delayMin > 30) {
        await this.alertConcierge(arrival, `Vol retardé de ${Math.round(delayMin)} min`);
      }
    }

    if (payload.status === 'LANDED') {
      newStatus = 'EN_ROUTE';
      // Créer une task urgente pour le transport
      await prisma.arrivalTask.create({
        data: {
          arrivalId: arrival.id,
          hotelId,
          team: 'TRANSPORT',
          title: `Client a atterri — envoyer véhicule`,
          description: `Vol ${payload.flightNumber}${payload.gate ? ` · Porte ${payload.gate}` : ''}`,
          priority: 2,
          isCritical: true,
          status: 'PENDING',
          blockedBy: '[]',
        },
      });
    }

    if (payload.status === 'CANCELLED') {
      newStatus = 'CANCELLED' as any; // Ignore type since cancelled is usually terminal or we use another state
      await this.alertConcierge(arrival, `⛔ Vol ${payload.flightNumber} ANNULÉ`, 'critical');
    }

    // Mise à jour de l'arrivée
    await prisma.arrival.update({
      where: { id: arrival.id },
      data: { status: newStatus, flightEta: newEta, version: { increment: 1 } },
    });

    // Audit
    await auditService.append({
      eventType: 'arrival.flight_update',
      tenantId: hotelId,
      actorId: 'system',
      actorType: 'system',
      resourceType: 'Arrival',
      resourceId: arrival.id,
      action: `flight.${payload.status.toLowerCase()}`,
      metadata: { flightNumber: payload.flightNumber, newEta: newEta?.toISOString() },
    });

    // Broadcast Socket.IO
    try {
      const realtime = getRealtimeServer();
      realtime.emitToHotel(hotelId, 'arrival:flight-update', {
        arrivalId: arrival.id,
        flightStatus: payload.status,
        newEta,
        newStatus,
      });
    } catch (_) {}
  }

  async processDriverUpdate(payload: DriverUpdatePayload, hotelId: string): Promise<void> {
    const arrival = await prisma.arrival.findFirst({
      where: { id: payload.arrivalId, hotelId },
    });
    if (!arrival) return;

    const driverEta = new Date(Date.now() + payload.etaMinutes * 60_000);

    // Persister
    await prisma.externalUpdate.create({
      data: {
        arrivalId: arrival.id,
        source: 'driver_api',
        updateType: 'location',
        payload: JSON.stringify(payload),
        processedAt: new Date(),
      },
    });

    const newStatus = payload.status === 'AT_LOCATION' ? 'ARRIVED' : 'EN_ROUTE';

    await prisma.arrival.update({
      where: { id: arrival.id },
      data: { driverEta, status: newStatus, version: { increment: 1 } },
    });

    if (payload.status === 'STUCK') {
      await this.alertConcierge(arrival, 'Chauffeur bloqué dans le trafic', 'warning');
    }

    try {
      const realtime = getRealtimeServer();
      realtime.emitToHotel(hotelId, 'arrival:driver-update', {
        arrivalId: arrival.id,
        driverEta,
        etaMinutes: payload.etaMinutes,
        status: payload.status,
      });
    } catch (_) {}
  }

  private async alertConcierge(
    arrival: any,
    message: string,
    severity: 'info' | 'warning' | 'critical' = 'info'
  ): Promise<void> {
    if (arrival.hostUserId) {
      try {
        const { pushNotificationService } = await import('../../services/push-notification.service.js');
        await pushNotificationService.sendToUser(arrival.hostUserId, {
          title: `${severity === 'critical' ? '🚨' : '⚠️'} ${arrival.guestName}`,
          body: message,
          url: `/arrivals/${arrival.id}`,
          tag: 'arrival-alert',
          data: { arrivalId: arrival.id, severity },
        });
      } catch (_) {}
    }

    await auditService.append({
      eventType: 'arrival.alert',
      tenantId: arrival.hotelId,
      actorId: 'system',
      actorType: 'system',
      resourceType: 'Arrival',
      resourceId: arrival.id,
      action: 'arrival.alert',
      metadata: { message, severity },
    });
  }
}

export const externalSyncService = new ExternalSyncService();
