/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { IChannelConnector, OtaChannelCapabilities, AvailabilityUpdate, ReservationFromOta, OtaAuthResult } from './channel.interface.js';
import type { Channel } from '@prisma/client';
import { decryptJson } from '../../lib/crypto.js';
import { format } from 'date-fns';

export class ExpediaConnector implements IChannelConnector {
  readonly type = 'EXPEDIA' as const;
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
      baseURL: credentials.sandbox 
        ? 'https://test.ean.com/v3' 
        : 'https://api.ean.com/v3',
      auth: { username: credentials.apiKey, password: credentials.sharedSecret },
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
  }
  
  async authenticate(credentials: any): Promise<OtaAuthResult> {
    try {
      const client = this.getClient(credentials);
      const res = await client.get(`/properties/${credentials.propertyId}`);
      if (res.status === 200) {
        return { success: true, externalHotelId: credentials.propertyId };
      }
      return { success: false, error: `HTTP ${res.status}` };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  
  async pushAvailability(channel: Channel, updates: AvailabilityUpdate[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const credentials = decryptJson(channel.credentials as any);
    const client = this.getClient(credentials);
    
    let success = 0, failed = 0;
    const errors: string[] = [];
    
    for (const update of updates) {
      try {
        await client.put(`/properties/${channel.externalHotelId}/availability`, {
          roomTypeId: this.mapRoomType(channel, update.roomType),
          date: format(update.date, 'yyyy-MM-dd'),
          available: update.available,
          rate: { currency: 'EUR', value: update.price },
          restrictions: { minLOS: update.minLOS, maxLOS: update.maxLOS },
        });
        success++;
      } catch (e: any) {
        failed++;
        if (errors.length < 10) errors.push(`${format(update.date, 'yyyy-MM-dd')}: ${e.message}`);
      }
    }
    
    return { success, failed, errors };
  }
  
  async pullReservations(channel: Channel, since: Date): Promise<ReservationFromOta[]> {
    const credentials = decryptJson(channel.credentials as any);
    const client = this.getClient(credentials);
    try {
      const res = await client.get(`/properties/${channel.externalHotelId}/reservations`, {
        params: { modifiedSince: since.toISOString() },
      });
      return (res.data.reservations ?? []).map((r: any) => ({
        externalId: r.id,
        guestName: `${r.primaryGuest.firstName} ${r.primaryGuest.lastName}`,
        guestEmail: r.primaryGuest.email,
        guestPhone: r.primaryContact?.phone,
        checkIn: new Date(r.checkInDate),
        checkOut: new Date(r.checkOutDate),
        adults: r.occupancy.adults,
        children: r.occupancy.children ?? 0,
        externalRoomId: r.roomTypeId,
        roomType: r.roomTypeName,
        totalPrice: r.totalAmount.value,
        currency: r.totalAmount.currency,
        commissionPct: r.commissionRate ?? 0.18,
        status: r.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED',
        rawData: r,
      }));
    } catch (e: any) {
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
