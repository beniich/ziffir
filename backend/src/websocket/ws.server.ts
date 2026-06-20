// src/websocket/ws.server.ts

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

interface WSMessage {
  type: string;
  data: any;
  timestamp?: number;
}

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export const initWebSocket = (server: any): WebSocketServer => {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WS] Client connecté depuis ${ip}`);

    clients.add(ws);

    // Message de bienvenue
    ws.send(JSON.stringify({
      type: 'CONNECTION_ESTABLISHED',
      data: { message: 'Zaphir Command Center WS connected' },
      timestamp: Date.now(),
    }));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        console.log('[WS] Message reçu:', msg.type);

        // Echo pour tests
        if (msg.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch (err) {
        console.error('[WS] Erreur parsing message:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('[WS] Client déconnecté');
    });

    ws.on('error', (err) => {
      console.error('[WS] Erreur:', err);
      clients.delete(ws);
    });
  });

  // Ping périodique pour garder les connexions actives
  setInterval(() => {
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    });
  }, 30_000);

  return wss;
};

/**
 * Diffuse un message à tous les clients connectés.
 */
export const broadcastUpdate = (message: Omit<WSMessage, 'timestamp'>) => {
  const payload = JSON.stringify({
    ...message,
    timestamp: Date.now(),
  });

  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
};

/**
 * Envoie un message à un client spécifique (par ID).
 */
export const sendToClient = (clientId: string, message: WSMessage) => {
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
};

export const getConnectedClientsCount = (): number => clients.size;
