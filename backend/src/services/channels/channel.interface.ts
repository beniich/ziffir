import type { Channel } from '@prisma/client';

export type RoomTypeMapping = {
  ourRoomType: string;
  externalRoomId: string;
  externalRoomName?: string;
  maxOccupancy?: number;
};

export type RatePlanMapping = {
  ourRatePlan: string;
  externalRatePlanId: string;
  markup?: number;  // % ajouté au prix de base
};

export type AvailabilityUpdate = {
  roomType: string;
  date: Date;
  available: number;     // nombre de chambres dispo
  price?: number;        // optionnel : met aussi à jour le prix
  minLOS?: number;       // min length of stay
  maxLOS?: number;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
};

export type ReservationFromOta = {
  externalId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  externalRoomId: string;
  roomType: string;
  totalPrice: number;
  currency: string;
  commissionPct?: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'MODIFIED' | 'NO_SHOW';
  rawData: any;
};

export type OtaAuthResult = {
  success: boolean;
  externalHotelId?: string;
  error?: string;
};

export type OtaChannelCapabilities = {
  pushAvailability: boolean;
  pushRates: boolean;
  pullReservations: boolean;
  minLOS: boolean;
  maxLOS: boolean;
  restrictions: boolean; // closed to arrival/departure
  contentManagement: boolean; // photos, descriptions
  requiresCredentials: boolean;
};

/**
 * Interface qu'implémente tout connecteur OTA.
 */
export interface IChannelConnector {
  /** Type de canal */
  readonly type: 'BOOKING_COM' | 'EXPEDIA' | 'AIRBNB' | 'AGODA' | 'HOTELS_COM' | 'CUSTOM_OTA' | 'DIRECT';
  
  /** Ce que ce canal supporte */
  readonly capabilities: OtaChannelCapabilities;
  
  /**
   * Valide les credentials et retourne l'ID hôtel chez l'OTA.
   */
  authenticate(credentials: any): Promise<OtaAuthResult>;
  
  /**
   * Pousse les dispos et prix sur l'OTA.
   */
  pushAvailability(channel: Channel, updates: AvailabilityUpdate[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }>;
  
  /**
   * Récupère les nouvelles réservations depuis l'OTA.
   */
  pullReservations(channel: Channel, since: Date): Promise<ReservationFromOta[]>;
  
  /**
   * Annule une réservation côté OTA.
   */
  cancelReservation(channel: Channel, externalId: string, reason?: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Modifie une réservation côté OTA.
   */
  modifyReservation?(channel: Channel, externalId: string, changes: any): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Webhook handler (si supporté).
   */
  handleWebhook?(payload: any, headers: Record<string, string>): Promise<{
    type: 'NEW_RESERVATION' | 'CANCELLATION' | 'MODIFICATION' | 'PRICE_CHANGE';
    data: any;
  } | null>;
}
