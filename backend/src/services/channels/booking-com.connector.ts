/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { IChannelConnector, OtaChannelCapabilities, AvailabilityUpdate, ReservationFromOta, OtaAuthResult } from './channel.interface.js';
import type { Channel } from '@prisma/client';
import { decryptJson } from '../../lib/crypto.js';
import { format } from 'date-fns';

export class BookingComConnector implements IChannelConnector {
  readonly type = 'BOOKING_COM' as const;
  readonly capabilities: OtaChannelCapabilities = {
    pushAvailability: true,
    pushRates: true,
    pullReservations: true,
    minLOS: true,
    maxLOS: true,
    restrictions: true,
    contentManagement: true,
    requiresCredentials: true,
  };
  
  private getClient(credentials: any): AxiosInstance {
    return axios.create({
      baseURL: 'https://supply-xml.booking.com/hotels/xml',
      auth: {
        username: credentials.username,
        password: credentials.password,
      },
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
  }
  
  async authenticate(credentials: any): Promise<OtaAuthResult> {
    try {
      const client = this.getClient(credentials);
      const hotelId = credentials.hotelId;
      const res = await client.get(`/hotels/${hotelId}`);
      if (res.status === 200) {
        return { success: true, externalHotelId: hotelId };
      }
      return { success: false, error: `HTTP ${res.status}` };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.message ?? e.message };
    }
  }
  
  async pushAvailability(channel: Channel, updates: AvailabilityUpdate[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const credentials = decryptJson(channel.credentials as any);
    const client = this.getClient(credentials);
    
    const errors: string[] = [];
    let success = 0;
    let failed = 0;
    
    for (const update of updates) {
      try {
        await client.post(`/hotels/${channel.externalHotelId}/availability`, {
          roomTypeId: this.mapRoomType(channel, update.roomType),
          date: format(update.date, 'yyyy-MM-dd'),
          available: update.available,
          rate: update.price,
          restrictions: {
            minLOS: update.minLOS,
            maxLOS: update.maxLOS,
            closedToArrival: update.closedToArrival ?? false,
            closedToDeparture: update.closedToDeparture ?? false,
          },
        });
        success++;
      } catch (e: any) {
        failed++;
        if (errors.length < 10) errors.push(`${update.roomType} ${format(update.date, 'yyyy-MM-dd')}: ${e.response?.data?.message ?? e.message}`);
      }
    }
    
    return { success, failed, errors };
  }
  
  async pullReservations(channel: Channel, since: Date): Promise<ReservationFromOta[]> {
    const credentials = decryptJson(channel.credentials as any);
    const client = this.getClient(credentials);
    
    try {
      const res = await client.get(`/hotels/${channel.externalHotelId}/reservations`, {
        params: { since: since.toISOString() },
      });
      
      return (res.data.reservations ?? []).map((r: any) => ({
        externalId: r.id,
        guestName: `${r.guest.firstName} ${r.guest.lastName}`,
        guestEmail: r.guest.email,
        guestPhone: r.guest.phone,
        checkIn: new Date(r.checkIn),
        checkOut: new Date(r.checkOut),
        adults: r.occupancy.adults,
        children: r.occupancy.children ?? 0,
        externalRoomId: r.roomId,
        roomType: r.roomTypeName,
        totalPrice: r.totalPrice.amount,
        currency: r.totalPrice.currency,
        commissionPct: r.commission ?? 0.15,
        status: r.status === 'cancelled' ? 'CANCELLED' : r.status === 'modified' ? 'MODIFIED' : 'CONFIRMED',
        rawData: r,
      }));
    } catch (e: any) {
      console.error('Booking.com pull failed:', e.message);
      return [];
    }
  }
  
  async cancelReservation(channel: Channel, externalId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    const credentials = decryptJson(channel.credentials as any);
    const client = this.getClient(credentials);
    try {
      await client.post(`/reservations/${externalId}/cancel`, { reason });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  
  private mapRoomType(channel: Channel, ourType: string): string {
    const mapping = (channel.roomMapping as Record<string, string>) ?? {};
    return mapping[ourType] ?? ourType;
  }
}
