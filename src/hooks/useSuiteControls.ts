// src/hooks/useSuiteControls.ts
// ============================================================================
// Hook métier Suite Controls — REST (init) + Socket.IO (live updates)
// Optimistic updates avec rollback en cas de conflit de version
// ============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';

export interface SuiteState {
  id: string;
  hotelId: string;
  roomId: string;
  temperatureC: number;
  humidity: number | null;
  lightLevel: number;
  curtainsOpen: boolean;
  musicPlaying: boolean;
  musicTrackId: string | null;
  scene: 'IDLE' | 'WELCOME' | 'MORNING' | 'WORK' | 'DINNER' | 'NIGHT' | 'AWAY' | 'CUSTOM';
  isOccupied: boolean;
  doNotDisturb: boolean;
  maintenanceMode: boolean;
  version: number;
  lastUpdatedAt: string;
  room: {
    id: string;
    number: string;
    floor: number | null;
    type: string;
  };
}

interface SuiteUpdates {
  temperatureC?: number;
  lightLevel?: number;
  curtainsOpen?: boolean;
  musicPlaying?: boolean;
  musicTrackId?: string | null;
  scene?: SuiteState['scene'];
  doNotDisturb?: boolean;
  maintenanceMode?: boolean;
  isOccupied?: boolean;
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

interface UseSuiteControlsOptions {
  /** Si fourni, ne suit qu'une seule suite */
  roomId?: string;
}

export function useSuiteControls(options: UseSuiteControlsOptions = {}) {
  const { socket, isConnected } = useSocket();
  const [states, setStates] = useState<Map<string, SuiteState>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const statesRef = useRef(states);
  statesRef.current = states;

  // --------------------------------------------------------------------------
  // Chargement initial depuis le backend REST
  // --------------------------------------------------------------------------
  useEffect(() => {
    const url = options.roomId
      ? `/api/suite-controls/${options.roomId}`
      : `/api/suite-controls`;

    setLoading(true);
    setError(null);

    fetch(url, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!data.success) throw new Error(data.error?.message || 'Erreur API');

        if (options.roomId) {
          setStates(new Map([[data.data.roomId, data.data]]));
        } else {
          const map = new Map<string, SuiteState>();
          (data.data as SuiteState[]).forEach(s => map.set(s.roomId, s));
          setStates(map);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [options.roomId]);

  // --------------------------------------------------------------------------
  // Live updates via Socket.IO (broadcast depuis le serveur)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handler = (payload: {
      roomId: string;
      state: SuiteState;
      updatedBy: string;
    }) => {
      setStates(prev => {
        const next = new Map(prev);
        next.set(payload.roomId, payload.state);
        return next;
      });
    };

    socket.on('suite:updated', handler);
    return () => { socket.off('suite:updated', handler); };
  }, [socket, isConnected]);

  // --------------------------------------------------------------------------
  // Mise à jour optimiste + rollback sur conflit
  // --------------------------------------------------------------------------
  const updateSuite = useCallback(async (
    roomId: string,
    updates: SuiteUpdates
  ): Promise<ActionResult> => {
    const current = statesRef.current.get(roomId);
    if (!current) return { ok: false, error: 'Suite inconnue' };

    // Mise à jour optimiste locale
    const optimistic: SuiteState = {
      ...current,
      ...updates,
      version: current.version + 1,
      lastUpdatedAt: new Date().toISOString(),
    };
    setStates(prev => new Map(prev).set(roomId, optimistic));

    try {
      const res = await fetch(`/api/suite-controls/${roomId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, version: current.version }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Rollback vers l'état précédent
        setStates(prev => new Map(prev).set(roomId, current));

        if (data.error?.code === 'VERSION_CONFLICT' && data.error.currentState) {
          // Appliquer la version serveur (source de vérité)
          setStates(prev => new Map(prev).set(roomId, data.error.currentState));
          return { ok: false, error: 'Conflit : la suite a été modifiée en même temps' };
        }
        return { ok: false, error: data.error?.message || 'Erreur' };
      }

      // Confirmer avec la version serveur
      setStates(prev => new Map(prev).set(roomId, data.data));
      return { ok: true };
    } catch (e: any) {
      setStates(prev => new Map(prev).set(roomId, current));
      return { ok: false, error: e.message };
    }
  }, []);

  // --------------------------------------------------------------------------
  // API sémantique
  // --------------------------------------------------------------------------
  const setScene = useCallback(
    (roomId: string, scene: SuiteState['scene']) => updateSuite(roomId, { scene }),
    [updateSuite]
  );

  const setTemperature = useCallback(
    (roomId: string, temp: number) => updateSuite(roomId, { temperatureC: temp, scene: 'CUSTOM' }),
    [updateSuite]
  );

  const setLight = useCallback(
    (roomId: string, level: number) => updateSuite(roomId, { lightLevel: level, scene: 'CUSTOM' }),
    [updateSuite]
  );

  const toggleCurtains = useCallback((roomId: string) => {
    const current = statesRef.current.get(roomId);
    if (!current) return Promise.resolve({ ok: false as const, error: 'Suite inconnue' });
    return updateSuite(roomId, { curtainsOpen: !current.curtainsOpen, scene: 'CUSTOM' });
  }, [updateSuite]);

  const toggleDnd = useCallback((roomId: string) => {
    const current = statesRef.current.get(roomId);
    if (!current) return Promise.resolve({ ok: false as const, error: 'Suite inconnue' });
    return updateSuite(roomId, { doNotDisturb: !current.doNotDisturb });
  }, [updateSuite]);

  const toggleMusic = useCallback((roomId: string) => {
    const current = statesRef.current.get(roomId);
    if (!current) return Promise.resolve({ ok: false as const, error: 'Suite inconnue' });
    return updateSuite(roomId, { musicPlaying: !current.musicPlaying, scene: 'CUSTOM' });
  }, [updateSuite]);

  return {
    states,
    getSuite: (roomId: string) => states.get(roomId),
    allSuites: Array.from(states.values()),

    // Actions
    updateSuite,
    setScene,
    setTemperature,
    setLight,
    toggleCurtains,
    toggleDnd,
    toggleMusic,

    // Statuts
    loading,
    error,
    isLive: isConnected,
  };
}
