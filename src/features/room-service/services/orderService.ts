// src/features/room-service/services/orderService.ts

import { api, ApiError } from '../../../shared/api/client';

export type OrderStatus = 'Preparation' | 'Quality Check' | 'Out for Delivery' | 'Delivered';
export type OrderPriority = 'low' | 'normal' | 'high';

export interface OrderItem {
  courseCode: string;
  name: string;
  quantity: number;
  price: number;
}

export interface RoomOrder {
  id: string;
  orderRef: string;
  roomNumber: string;
  guestName: string;
  guestVIP: boolean;
  status: OrderStatus;
  priority: OrderPriority;
  notes?: string;
  subtotal: number;
  vat: number;
  serviceCharge: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

export interface CreateOrderPayload {
  roomNumber: string;
  guestName: string;
  guestVIP?: boolean;
  items: { courseCode: string; quantity: number }[];
  notes?: string;
  priority?: OrderPriority;
}

export class OrderService {
  /**
   * Récupère toutes les commandes.
   */
  static async getAll(): Promise<RoomOrder[]> {
    try {
      const res = await api.roomService.getOrders();
      return res.data ?? res;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error('Erreur de chargement des commandes');
    }
  }

  /**
   * Fait avancer le statut d'une commande.
   */
  static async advance(id: string): Promise<RoomOrder> {
    try {
      const res = await api.roomService.advanceOrder(id);
      return res.data ?? res;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error("Erreur lors de l'avancement");
    }
  }

  /**
   * Crée une nouvelle commande.
   */
  static async create(payload: CreateOrderPayload): Promise<RoomOrder> {
    try {
      const res = await api.roomService.createOrder(payload);
      return res.data ?? res;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error('Erreur lors de la création');
    }
  }
}
