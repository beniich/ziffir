import axios from 'axios';
import { prisma } from '../../../lib/prisma';
import { auditService } from '../../shared/services/audit.service';

interface MewsConfig {
  clientToken: string;
  accessToken: string;
  baseUrl: string;
}

export class MewsIntegrationService {
  private config: MewsConfig;
  
  constructor(config: MewsConfig) {
    this.config = config;
  }
  
  /**
   * Récupère les réservations à venir pour synchronisation
   * Doc : https://mews-systems.gitbook.io/connector-api/
   */
  async getUpcomingReservations(hotelId: string, daysAhead = 90) {
    const startDate = new Date();
    const endDate = new Date(Date.now() + daysAhead * 86400000);
    
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/connector/v1/reservations/getAll`,
        {
          ClientToken: this.config.clientToken,
          AccessToken: this.config.accessToken,
          StartUtc: startDate.toISOString(),
          EndUtc: endDate.toISOString(),
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );
      
      return response.data.Reservations || [];
    } catch (e) {
      console.error('[Mews] Sync error:', e);
      throw e;
    }
  }
  
  /**
   * Sync bidirectionnelle : crée/met à jour les Arrivals Ziffir depuis Mews
   */
  async syncReservationsToArrivals(hotelId: string) {
    const reservations = await this.getUpcomingReservations(hotelId);
    
    const results = { created: 0, updated: 0, errors: 0 };
    
    for (const m of reservations) {
      try {
        const externalRef = m.Id;
        
        // Mapping Mews → Ziffir
        const guestName = `${m.Customer?.FirstName || ''} ${m.Customer?.LastName || ''}`.trim();
        const guestEmail = m.Customer?.Email;
        const guestPhone = m.Customer?.Phone;
        const vipLevel = this.mapVipLevel(m.Customer?.Classifications);
        
        // Cherche si l'arrivée existe déjà
        const existing = await prisma.arrival.findFirst({
          where: { hotelId, externalRef },
        });
        
        if (existing) {
          await prisma.arrival.update({
            where: { id: existing.id },
            data: {
              guestName,
              guestEmail,
              guestPhone,
              vipLevel,
              scheduledArrivalAt: new Date(m.ArrivalUtc),
              scheduledDepartureAt: new Date(m.DepartureUtc),
            },
          });
          results.updated++;
        } else {
          await prisma.arrival.create({
            data: {
              hotelId,
              externalRef,
              guestName: guestName || 'Guest',
              guestEmail,
              guestPhone,
              vipLevel,
              scheduledArrivalAt: new Date(m.ArrivalUtc),
              scheduledDepartureAt: new Date(m.DepartureUtc),
              roomId: m.AssignedResourceId, // Mews resource = room
              transportMode: 'WALKING', // À raffiner
              status: 'SCHEDULED',
              createdById: 'system',
            },
          });
          results.created++;
        }
      } catch (e) {
        console.error('[Mews] Arrival sync error:', e);
        results.errors++;
      }
    }
    
    await auditService.append({
      eventType: 'integration.mews.sync',
      tenantId: hotelId,
      actorType: 'system',
      action: 'mews.sync',
      metadata: results,
    });
    
    return results;
  }
  
  /**
   * Push d'un event Ziffir vers Mews (ex: check-in effectué)
   */
  async pushCheckInToMews(arrivalId: string) {
    const arrival = await prisma.arrival.findUnique({
      where: { id: arrivalId },
      include: { room: true, hotel: true },
    });
    
    if (!arrival?.externalRef) {
      throw new Error('Arrival has no Mews reference');
    }
    
    // Update Mews via API
    await axios.post(
      `${this.config.baseUrl}/api/connector/v1/reservations/update`,
      {
        ClientToken: this.config.clientToken,
        AccessToken: this.config.accessToken,
        ReservationUpdates: [{
          Id: arrival.externalRef,
          State: 'CheckedIn',
        }],
      }
    );
  }
  
  private mapVipLevel(classifications: any[]): 'CLASSIC' | 'PREFERRED' | 'VIP' | 'PRESTIGE' | 'ROYAL' {
    // Mews loyalty classification mapping
    if (!classifications) return 'CLASSIC';
    if (classifications.includes('Royal')) return 'ROYAL';
    if (classifications.includes('Prestige')) return 'PRESTIGE';
    if (classifications.includes('VIP')) return 'VIP';
    if (classifications.includes('Preferred')) return 'PREFERRED';
    return 'CLASSIC';
  }
}
