// src/hooks/useSocket.ts
// ============================================================================
// Singleton Socket.IO client — une seule connexion WebSocket par onglet
// Auth : envoie le Bearer token via socket.auth.token
// ============================================================================

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;
const subscribers = new Set<() => void>();

function getToken(): string {
  // On récupère le token exposé par zaphirApi (défini dans apiClient.ts)
  return (window as any).__zaphir_token__ || 'sandbox-token-proprietor';
}

function getSocket(): Socket {
  if (socketInstance) return socketInstance;

  const url = (import.meta as any).env?.VITE_API_URL || window.location.origin;

  socketInstance = io(url, {
    auth: { token: getToken() },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10_000,
  });

  socketInstance.on('connect', () => {
    console.log('[socket] ✅ Connected', socketInstance!.id);
    subscribers.forEach(cb => cb());
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('[socket] ❌ Disconnected:', reason);
    subscribers.forEach(cb => cb());
  });

  socketInstance.on('connect_error', (err) => {
    console.error('[socket] Connection error:', err.message);
  });

  return socketInstance;
}

/** Permet de changer le token après une (re)connexion */
export function updateSocketToken(token: string) {
  (window as any).__zaphir_token__ = token;
  if (socketInstance) {
    socketInstance.auth = { token };
    socketInstance.disconnect();
    socketInstance.connect();
  }
}

/** Ferme la connexion (ex: logout) */
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    subscribers.clear();
  }
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket>(getSocket());

  useEffect(() => {
    const socket = socketRef.current;
    setIsConnected(socket.connected);

    const cb = () => setIsConnected(socket.connected);
    subscribers.add(cb);

    return () => {
      subscribers.delete(cb);
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
}
