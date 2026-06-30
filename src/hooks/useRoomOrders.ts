// src/hooks/useRoomOrders.ts
// ============================================================================
// Hook temps réel pour Room Orders - file d'attente + actions
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from './useToast';

export type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY'
  | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';

export interface RoomOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  previousStatus: OrderStatus | null;
  
  room: { id: string; number: string; floor: number | null };
  guestName: string;
  guestId: string | null;
  placedById: string | null;
  
  items: Array<{
    id: string;
    nameSnapshot: string;
    quantity: number;
    customizations: Record<string, any> | null;
    itemNotes: string | null;
    status: string;
    menuItem: { name: string; imageUrl: string | null };
  }>;
  
  subtotalCents: number;
  serviceFeeCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  
  guestNotes: string | null;
  kitchenNotes: string | null;
  
  estimatedReadyAt: string | null;
  placedAt: string;
  acknowledgedAt: string | null;
  startedPrepAt: string | null;
  readyAt: string | null;
  deliveredAt: string | null;
  
  assignedChef: { id: string; displayName: string } | null;
  assignedServer: { id: string; displayName: string } | null;
  
  version: number;
  rating: number | null;
}

export type OrderView = 'active' | 'kitchen' | 'delivery' | 'history' | 'mine';

interface UseRoomOrdersOptions {
  view?: OrderView;
  roomId?: string;
}

export function useRoomOrders(options: UseRoomOrdersOptions = {}) {
  const { socket, isConnected } = useSocket();
  const { user } = useAppContext();
  const toast = useToast();
  const [orders, setOrders] = useState<RoomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --------------------------------------------------------------------------
  // Chargement initial + filtres
  // --------------------------------------------------------------------------
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (options.view === 'kitchen') {
      params.set('status', 'PENDING,CONFIRMED,PREPARING');
    } else if (options.view === 'delivery') {
      params.set('status', 'READY,OUT_FOR_DELIVERY');
    } else if (options.view === 'history') {
      params.set('status', 'DELIVERED,CANCELLED,REJECTED');
    } else if (options.view === 'mine') {
      params.set('assignedToMe', 'true');
    } else if (options.view === 'active') {
      params.set('status', 'PENDING,CONFIRMED,PREPARING,READY,OUT_FOR_DELIVERY');
    }
    if (options.roomId) params.set('roomId', options.roomId);
    return params.toString();
  }, [options.view, options.roomId]);
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const qs = buildQueryString();
    fetch(`/api/room-orders${qs ? `?${qs}` : ''}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setOrders(data.data || []);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [buildQueryString]);
  
  // --------------------------------------------------------------------------
  // Live updates
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    const onUpdate = (order: RoomOrder) => {
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === order.id);
        if (idx === -1) {
          return [order, ...prev];
        }
        const next = [...prev];
        next[idx] = order;
        return next;
      });
    };
    
    const onNew = (order: RoomOrder) => {
      setOrders(prev => {
        if (prev.some(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
      
      // Toast de notification
      toast.push(`🍽️ Nouvelle commande ${order.orderNumber} - Suite ${order.room.number}`, 'info');
    };
    
    socket.on('order:updated', onUpdate);
    socket.on('order:new', onNew);
    
    return () => {
      socket.off('order:updated', onUpdate);
      socket.off('order:new', onNew);
    };
  }, [socket, isConnected, toast]);
  
  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  const transition = useCallback(async (
    orderId: string,
    toStatus: OrderStatus,
    transitionOptions: { reason?: string; version: number } = { version: 0 }
  ) => {
    try {
      const res = await fetch(`/api/room-orders/${orderId}/transition`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toStatus,
          reason: transitionOptions.reason,
          version: transitionOptions.version,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error?.code === 'VERSION_CONFLICT') {
          toast.push('Conflit : commande mise à jour par quelqu\'un d\'autre', 'error');
          // Recharger la liste
          const qs = buildQueryString();
          const r = await fetch(`/api/room-orders${qs ? `?${qs}` : ''}`, { credentials: 'include' });
          const d = await r.json();
          setOrders(d.data || []);
        } else {
          toast.push(data.error?.message || 'Erreur', 'error');
        }
        return false;
      }
      
      toast.push(`✅ Commande ${data.data.orderNumber} → ${toStatus}`, 'success');
      return true;
    } catch (e: any) {
      toast.push(e.message, 'error');
      return false;
    }
  }, [buildQueryString, toast]);
  
  const rate = useCallback(async (orderId: string, rating: number, feedback?: string) => {
    const res = await fetch(`/api/room-orders/${orderId}/rate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, feedback }),
    });
    return res.ok;
  }, []);
  
  // --------------------------------------------------------------------------
  // Stats (pour les KPI en header)
  // --------------------------------------------------------------------------
  const stats = {
    pending: orders.filter(o => o.status === 'PENDING').length,
    preparing: orders.filter(o => o.status === 'PREPARING').length,
    ready: orders.filter(o => o.status === 'READY').length,
    avgPrepTime: (() => {
      const completed = orders.filter(o => o.deliveredAt && o.acknowledgedAt);
      if (completed.length === 0) return null;
      const totalMs = completed.reduce((sum, o) => {
        return sum + (new Date(o.deliveredAt!).getTime() - new Date(o.acknowledgedAt!).getTime());
      }, 0);
      return Math.round(totalMs / completed.length / 60000); // minutes
    })(),
  };
  
  return {
    orders,
    loading,
    error,
    isLive: isConnected,
    transition,
    rate,
    stats,
    
    // Helpers
    getByStatus: (status: OrderStatus) => orders.filter(o => o.status === status),
    getByRoom: (roomId: string) => orders.find(o => o.room.id === roomId && o.status !== 'DELIVERED'),
  };
}
