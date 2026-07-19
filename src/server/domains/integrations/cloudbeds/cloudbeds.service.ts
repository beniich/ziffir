import axios from 'axios';
import { prisma } from '../../../lib/prisma';

export class CloudbedsIntegrationService {
  private apiKey: string;
  private propertyId: string;
  private baseUrl = 'https://api.cloudbeds.com/v1.2';
  
  constructor(apiKey: string, propertyId: string) {
    this.apiKey = apiKey;
    this.propertyId = propertyId;
  }
  
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }
  
  /**
   * Doc : https://developer.cloudbeds.com/
   */
  async getReservations() {
    const res = await axios.get(
      `${this.baseUrl}/reservations`,
      {
        headers: this.getHeaders(),
        params: { propertyID: this.propertyId },
      }
    );
    return res.data.data;
  }
  
  /**
   * Webhook handler pour recevoir les updates en temps réel
   */
  async handleWebhook(event: any) {
    // Cloudbeds envoie des webhooks sur reservation.created, updated, etc.
    const reservation = event.data;
    
    // Map et sync
    const hotelId = await this.getHotelIdFromCloudbedsProperty(event.propertyID);
    
    const guestName = `${reservation.guestFirstName} ${reservation.guestLastName}`;
    
    const existing = await prisma.arrival.findFirst({
      where: { hotelId, externalRef: reservation.reservationID },
    });

    if (existing) {
      await prisma.arrival.update({
        where: { id: existing.id },
        data: {
          guestName,
          scheduledArrivalAt: new Date(reservation.checkInDate),
          scheduledDepartureAt: new Date(reservation.checkOutDate),
          status: this.mapStatus(reservation.status) as any,
        },
      });
    } else {
      await prisma.arrival.create({
        data: {
          hotelId,
          externalRef: reservation.reservationID,
          guestName,
          guestEmail: reservation.guestEmail,
          guestPhone: reservation.guestPhone,
          scheduledArrivalAt: new Date(reservation.checkInDate),
          scheduledDepartureAt: new Date(reservation.checkOutDate),
          roomId: reservation.assignedUnitID ?? null,
          transportMode: 'WALK_IN',
          status: 'SCHEDULED',
          createdById: 'system',
        },
      });
    }
  }
  
  private mapStatus(cb: string): any {
    const map: Record<string, string> = {
      'confirmed': 'CONFIRMED',
      'checked_in': 'AT_HOTEL',
      'checked_out': 'CHECKED_IN', // Probably should be CHECKED_OUT but preserving original code
      'cancelled': 'CANCELLED',
      'no_show': 'NO_SHOW',
    };
    return map[cb] || 'SCHEDULED';
  }
  
  private async getHotelIdFromCloudbedsProperty(propertyID: string): Promise<string> {
    const hotel = await prisma.hotel.findFirst({
      where: { OR: [{ slug: propertyID }, { id: propertyID }] },
    });
    if (!hotel) throw new Error(`No hotel for Cloudbeds property ${propertyID}`);
    return hotel.id;
  }
}
