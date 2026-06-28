/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import type {
  IChannelConnector,
  OtaAuthResult,
  OtaChannelCapabilities,
  AvailabilityUpdate,
  ReservationFromOta,
} from './channel.interface.js';
import type { Channel } from '@prisma/client';

export class MockOtaConnector implements IChannelConnector {
  readonly type: any;
  readonly capabilities: OtaChannelCapabilities = {
    pushAvailability: true,
    pushRates: true,
    pullReservations: true,
    minLOS: true,
    maxLOS: true,
    restrictions: true,
    contentManagement: false,
    requiresCredentials: false,
  };
  
  // Stockage en mémoire des résas "reçues" pour le mock
  private mockReservations: Map<string, ReservationFromOta[]> = new Map();
  
  constructor(type: any) {
    this.type = type;
  }
  
  async authenticate(credentials: any): Promise<OtaAuthResult> {
    // En mock, on accepte toujours (avec un délai simulé)
    await new Promise(r => setTimeout(r, 500));
    return {
      success: true,
      externalHotelId: `mock-${this.type.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }
  
  async pushAvailability(channel: Channel, updates: AvailabilityUpdate[]): Promise<{ success: number; failed: number; errors: string[] }> {
    await new Promise(r => setTimeout(r, 200));
    // Simule 95% de succès
    const failed = Math.floor(updates.length * 0.05);
    return {
      success: updates.length - failed,
      failed,
      errors: failed > 0 ? [`${failed} items failed (mock)`] : [],
    };
  }
  
  async pullReservations(channel: Channel, since: Date): Promise<ReservationFromOta[]> {
    await new Promise(r => setTimeout(r, 300));
    
    // En mode mock, on peut injecter des résas "fictives" pour tester
    const mockKey = `mock-${channel.id}`;
    const existing = this.mockReservations.get(mockKey) ?? [];
    
    // 10% de chance d'avoir une nouvelle résa
    if (Math.random() < 0.1) {
      const newRes: ReservationFromOta = {
        externalId: `MOCK-${Date.now()}`,
        guestName: ['Smith', 'Garcia', 'Müller', 'Tanaka', 'Dubois'][Math.floor(Math.random() * 5)] + ' ' + ['John', 'Maria', 'Hans', 'Yuki', 'Pierre'][Math.floor(Math.random() * 5)],
        guestEmail: `guest${Date.now()}@example.com`,
        checkIn: new Date(Date.now() + (1 + Math.random() * 30) * 86400000),
        checkOut: new Date(Date.now() + (2 + Math.random() * 7) * 86400000),
        adults: 1 + Math.floor(Math.random() * 3),
        children: Math.floor(Math.random() * 2),
        externalRoomId: 'mock-room-1',
        roomType: 'Suite',
        totalPrice: 400 + Math.random() * 800,
        currency: 'EUR',
        commissionPct: 0.15,
        status: 'CONFIRMED',
        rawData: { source: 'mock', timestamp: Date.now() },
      };
      existing.push(newRes);
      this.mockReservations.set(mockKey, existing);
      return [newRes];
    }
    
    return [];
  }
  
  async cancelReservation(channel: Channel, externalId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(r => setTimeout(r, 200));
    return { success: true };
  }
  
  async handleWebhook(payload: any, headers: Record<string, string>): Promise<{ type: 'NEW_RESERVATION' | 'CANCELLATION' | 'MODIFICATION' | 'PRICE_CHANGE'; data: any } | null> {
    // Mock webhook
    if (payload?.type === 'new_reservation') {
      return { type: 'NEW_RESERVATION' as const, data: payload.data };
    }
    return null;
  }
}
