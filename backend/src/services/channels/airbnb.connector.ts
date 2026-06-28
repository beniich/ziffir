/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { IChannelConnector, OtaChannelCapabilities, AvailabilityUpdate, ReservationFromOta, OtaAuthResult } from './channel.interface.js';
import type { Channel } from '@prisma/client';
import { decryptJson } from '../../lib/crypto.js';
import { format } from 'date-fns';

export class AirbnbConnector implements IChannelConnector {
  readonly type = 'AIRBNB' as const;
  readonly capabilities: OtaChannelCapabilities = {
    pushAvailability: true,
    pushRates: true,
    pullReservations: true,
    minLOS: true,
    maxLOS: true,
    restrictions: false,
    contentManagement: true,
    requiresCredentials: true,
  };
  
  private getClient(credentials: any): AxiosInstance {
    return axios.create({
      baseURL: 'https://api.airbnb.com/v2',
      headers: {
        'X-Airbnb-API-Key': credentials.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }
  
  async authenticate(credentials: any): Promise<OtaAuthResult> {
    try {
      const client = this.getClient(credentials);
      const res = await client.get(`/listings/${credentials.listingId}`);
      if (res.status === 200) {
        return { success: true, externalHotelId: credentials.listingId };
      }
      return { success: false, error: `HTTP ${res.status}` };
    } catch (e: any) {
      return { success: false, error: e.response?.data?.error_message ?? e.message };
    }
  }
  
  async pushAvailability(channel: Channel, updates: AvailabilityUpdate[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const credentials = decryptJson(channel.credentials as any);
    const client = this.getClient(credentials);
    
    let success = 0, failed = 0;
    const errors: string[] = [];
    
    for (const update of updates) {
      try {
        await client.put(`/listings/${channel.externalHotelId}/calendar`, {
          date: format(update.date, 'yyyy-MM-dd'),
          available: update.available > 0,
          price: update.price,
          min_nights: update.minLOS,
          max_nights: update.maxLOS,
        });
        success++;
      } catch (e: any) {
        failed++;
        if (errors.length < 10) errors.push(`${format(update.date, 'yyyy-MM-dd')}: ${e.response?.data?.error_message ?? e.message}`);
      }
    }
    
    return { success, failed, errors };
  }
  
  async pullReservations(channel: Channel, since: Date): Promise<ReservationFromOta[]> {
    // Airbnb envoie les résas via webhook, pas via pull.
    return [];
  }
  
  async cancelReservation(channel: Channel, externalId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Cancellation manuelle requise côté Airbnb' };
  }
  
  async handleWebhook(payload: any, headers: Record<string, string>) {
    if (payload?.event_type === 'reservation_created' || payload?.event_type === 'reservation_updated') {
      return {
        type: 'NEW_RESERVATION' as const,
        data: payload.reservation,
      };
    }
    if (payload?.event_type === 'reservation_cancelled') {
      return {
        type: 'CANCELLATION' as const,
        data: payload.reservation,
      };
    }
    return null;
  }
}
