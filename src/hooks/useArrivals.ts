// src/hooks/useArrivals.ts
// ============================================================================
// Hook temps réel — Arrivals VIP + Tasks + Webhooks externes
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useToast } from './useToast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type VipLevel = 'CLASSIC' | 'PREFERRED' | 'VIP' | 'PRESTIGE' | 'ROYAL' | 'BLACKLISTED';
export type ArrivalStatus =
  | 'SCHEDULED' | 'CONFIRMED' | 'IN_PREPARATION'
  | 'DRIVER_EN_ROUTE' | 'ENROUTE' | 'LANDED'
  | 'AT_HOTEL' | 'NO_SHOW' | 'CHECKED_IN' | 'CANCELLED';
export type TaskStatus = 'PENDING' | 'BLOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type TeamType =
  | 'RECEPTION' | 'CONCIERGERIE' | 'HOUSEKEEPING' | 'KITCHEN'
  | 'BELL_SERVICE' | 'TRANSPORT' | 'SECURITY' | 'MANAGEMENT' | 'EXTERNAL';

export interface ArrivalTask {
  id: string;
  arrivalId: string;
  team: TeamType;
  title: string;
  description: string | null;
  status: TaskStatus;
  isCritical: boolean;
  priority: number;
  dueAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  assignedUser: { id: string; displayName: string } | null;
  blockedBy: string;  // JSON string "[]"
  evidenceUrl: string | null;
  version: number;
}

export interface Arrival {
  id: string;
  hotelId: string;
  guestName: string;
  guestEmail: string | null;
  vipLevel: VipLevel;
  status: ArrivalStatus;
  transportMode: string;
  flightNumber: string | null;
  flightOrigin: string | null;
  flightEta: string | null;
  driverName: string | null;
  driverEta: string | null;
  driverVehicle: string | null;
  scheduledArrivalAt: string;
  actualArrivalAt: string | null;
  room: { number: string; type: string } | null;
  meetingPoint: string | null;
  welcomeAmenity: string | null;
  dietaryNotes: string | null;
  suiteNotes: string | null;
  specialRequests: string | null;
  estimatedRevenueCents: number | null;
  host: { displayName: string } | null;
  tasks: ArrivalTask[];
  version: number;
}

// ---------------------------------------------------------------------------
// Options de liste
// ---------------------------------------------------------------------------
export interface UseArrivalsOptions {
  upcoming?: boolean;
  vipLevel?: VipLevel;
  status?: ArrivalStatus;
  from?: string;
  to?: string;
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------
export function useArrivals(options: UseArrivalsOptions = {}) {
  const { socket, isConnected } = useSocket();
  const toast = useToast();
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Chargement initial ---
  const buildQS = useCallback(() => {
    const p = new URLSearchParams();
    if (options.upcoming) p.set('upcoming', 'true');
    if (options.status)   p.set('status', options.status);
    if (options.vipLevel) p.set('vipLevel', options.vipLevel);
    if (options.from)     p.set('from', options.from);
    if (options.to)       p.set('to', options.to);
    return p.toString();
  }, [options.upcoming, options.status, options.vipLevel, options.from, options.to]);

  const reload = useCallback(() => {
    setLoading(true);
    const qs = buildQS();
    fetch(`/api/arrivals${qs ? `?${qs}` : ''}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setArrivals(d.data || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [buildQS]);

  useEffect(() => { reload(); }, [reload]);

  // --- Live updates ---
  useEffect(() => {
    if (!socket || !isConnected) return;

    const upsert = (updated: Arrival) =>
      setArrivals(prev => {
        const idx = prev.findIndex(a => a.id === updated.id);
        if (idx === -1) return [updated, ...prev];
        const next = [...prev];
        next[idx] = updated;
        return next;
      });

    const onNew = (payload: { arrival: Arrival }) => {
      upsert(payload.arrival);
      toast.push(`🌟 Nouvelle arrivée : ${payload.arrival.guestName}`, 'info');
    };
    const onUpdated = (updated: Arrival) => upsert(updated);

    const onTaskUpdated = (payload: { task: ArrivalTask; arrivalId: string }) => {
      setArrivals(prev => prev.map(a => {
        if (a.id !== payload.arrivalId) return a;
        const tasks = a.tasks.map(t => t.id === payload.task.id ? payload.task : t);
        return { ...a, tasks };
      }));
    };

    const onTaskNew = (payload: { task: ArrivalTask; arrivalId: string }) => {
      setArrivals(prev => prev.map(a => {
        if (a.id !== payload.arrivalId) return a;
        if (a.tasks.some(t => t.id === payload.task.id)) return a;
        return { ...a, tasks: [...a.tasks, payload.task] };
      }));
    };

    const onFlightUpdate = (payload: { arrivalId: string; flightStatus: string; newEta: string | null }) => {
      setArrivals(prev => prev.map(a =>
        a.id === payload.arrivalId ? { ...a, flightEta: payload.newEta } : a
      ));
    };

    const onDriverUpdate = (payload: { arrivalId: string; driverEta: string; etaMinutes: number }) => {
      setArrivals(prev => prev.map(a =>
        a.id === payload.arrivalId ? { ...a, driverEta: payload.driverEta } : a
      ));
    };

    socket.on('arrival:new', onNew);
    socket.on('arrival:updated', onUpdated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:new', onTaskNew);
    socket.on('arrival:flight-update', onFlightUpdate);
    socket.on('arrival:driver-update', onDriverUpdate);

    return () => {
      socket.off('arrival:new', onNew);
      socket.off('arrival:updated', onUpdated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:new', onTaskNew);
      socket.off('arrival:flight-update', onFlightUpdate);
      socket.off('arrival:driver-update', onDriverUpdate);
    };
  }, [socket, isConnected, toast]);

  // --- Actions ---
  const transition = useCallback(async (
    arrivalId: string,
    toStatus: ArrivalStatus,
    opts: { version: number; reason?: string; driverInfo?: any; actualArrivalAt?: string } = { version: 0 }
  ) => {
    try {
      const res = await fetch(`/api/arrivals/${arrivalId}/transition`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStatus, ...opts }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.code === 'CRITICAL_TASKS_PENDING') {
          toast.push(`❌ Tâches critiques non terminées : ${data.error.tasks?.join(', ')}`, 'error');
        } else {
          toast.push(data.error?.message || 'Erreur', 'error');
        }
        return false;
      }
      toast.push(`✅ ${toStatus}`, 'success');
      return true;
    } catch (e: any) {
      toast.push(e.message, 'error');
      return false;
    }
  }, [toast]);

  const updateTask = useCallback(async (
    taskId: string,
    updates: { status?: TaskStatus; version: number; notes?: string; evidenceUrl?: string; assignedUserId?: string }
  ) => {
    try {
      const res = await fetch(`/api/arrivals/tasks/${taskId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.push(data.error?.message || 'Erreur tâche', 'error');
        return false;
      }
      return true;
    } catch (e: any) {
      toast.push(e.message, 'error');
      return false;
    }
  }, [toast]);

  const createArrival = useCallback(async (payload: Record<string, any>) => {
    try {
      const res = await fetch('/api/arrivals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.push(data.error?.message || 'Erreur création', 'error');
        return null;
      }
      toast.push(`✅ Arrivée créée — ${data.data.taskCount} tâches générées`, 'success');
      return data.data;
    } catch (e: any) {
      toast.push(e.message, 'error');
      return null;
    }
  }, [toast]);

  // --- Stats pour le dashboard ---
  const stats = {
    today: arrivals.filter(a => {
      const d = new Date(a.scheduledArrivalAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
    royalCount: arrivals.filter(a => a.vipLevel === 'ROYAL').length,
    pendingTasks: arrivals.reduce(
      (sum, a) => sum + a.tasks.filter(t => t.status === 'PENDING').length, 0
    ),
    criticalPending: arrivals.reduce(
      (sum, a) => sum + a.tasks.filter(t => t.isCritical && t.status === 'PENDING').length, 0
    ),
  };

  return {
    arrivals,
    loading,
    error,
    isLive: isConnected,
    stats,
    reload,
    transition,
    updateTask,
    createArrival,

    // Filtres rapides
    upcoming: arrivals.filter(a => !['CHECKED_IN', 'CANCELLED', 'NO_SHOW'].includes(a.status)),
    byStatus: (s: ArrivalStatus) => arrivals.filter(a => a.status === s),
  };
}
