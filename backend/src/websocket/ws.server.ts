import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { URL } from 'url';
import { AuthService } from '../services/auth.service';
import type { UserContext } from '../services/permissions.service';

const logger = { info: console.log, error: console.error };

interface WSMessage {
  type: string;
  data: any;
  hotelId?: string;
  timestamp?: number;
}

interface AuthenticatedSocket extends WebSocket {
  userContext?: UserContext;
  isAlive?: boolean;
}

let wss: WebSocketServer | null = null;
const clients = new Set<AuthenticatedSocket>();

export const initWebSocket = (server: any): WebSocketServer => {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: AuthenticatedSocket, req: IncomingMessage) => {
    try {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(4001, 'Token manquant');
        return;
      }

      const decoded = AuthService.verifyAccessToken(token);
      ws.userContext = decoded as UserContext;
      ws.isAlive = true;

      logger.info({
        userId: decoded.userId,
        role: decoded.role,
        hotelId: decoded.hotelId,
      }, 'WS: Client connecté');

      clients.add(ws);

      ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        data: {
          message: 'Connecté',
          context: {
            role: decoded.role,
            hotelId: decoded.hotelId,
          },
        },
        timestamp: Date.now(),
      }));

      ws.on('pong', () => { ws.isAlive = true; });

      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          handleClientMessage(ws, msg);
        } catch (err) {
          logger.error({ err: (err as Error).message }, 'WS: Parse error');
        }
      });

      ws.on('close', () => {
        clients.delete(ws);
        logger.info({ userId: decoded.userId }, 'WS: Client déconnecté');
      });

      ws.on('error', (err) => {
        logger.error({ err: err.message }, 'WS: Error');
        clients.delete(ws);
      });
    } catch (err: any) {
      logger.error({ err: err.message }, 'WS: Auth failed');
      ws.close(4002, 'Authentification échouée');
    }
  });

  const heartbeat = setInterval(() => {
    clients.forEach((ws) => {
      if (ws.isAlive === false) {
        ws.terminate();
        clients.delete(ws);
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30_000);

  wss.on('close', () => clearInterval(heartbeat));

  return wss;
};

function handleClientMessage(ws: AuthenticatedSocket, msg: any): void {
  if (msg.type === 'PING') {
    ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
  }
  if (msg.type === 'SUBSCRIBE_HOTEL' && ws.userContext?.role === 'SUPER_ADMIN') {
    ws.send(JSON.stringify({ type: 'SUBSCRIBED', hotelId: msg.hotelId }));
  }
}

// ════════════════════════════════════════════════════════════
// BROADCAST AVEC FILTRAGE TENANT
// ════════════════════════════════════════════════════════════

export const broadcastUpdate = (message: Omit<WSMessage, 'timestamp'>): void => {
  const payload = JSON.stringify({
    ...message,
    timestamp: Date.now(),
  });

  clients.forEach((ws) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    if (!ws.userContext) return;

    const shouldDeliver = shouldReceiveMessage(ws.userContext, message);
    if (shouldDeliver) {
      ws.send(payload);
    }
  });
};

function shouldReceiveMessage(ctx: UserContext, message: WSMessage): boolean {
  if (!message.hotelId) return true;

  if (ctx.role === 'SUPER_ADMIN') return true;

  if (ctx.role === 'HOTEL') {
    return ctx.hotelId === message.hotelId;
  }

  if (ctx.role === 'CLIENT') {
    if (message.type === 'ORDER_CREATED' || message.type === 'ORDER_STATUS_CHANGED') {
      return message.data?.guestId === ctx.userId;
    }
    return false;
  }

  return false;
}

export const getConnectedClientsCount = (): number => clients.size;
