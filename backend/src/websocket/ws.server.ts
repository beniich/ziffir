import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { URL } from 'url';
import { AuthService } from '../services/auth.service';
import { UserContext } from '../services/permissions.service';
import { logger } from '../utils/logger';

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

/**
 * Initializes and starts the WebSockets Command Server
 */
export const initWebSocket = (server: any): WebSocketServer => {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: AuthenticatedSocket, req: IncomingMessage) => {
    try {
      // 1. JWT auth check using token query parameter
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(4001, 'Token is required');
        return;
      }

      // Verify and decoded JWT payload
      const decodedPayload = AuthService.verifyToken(token);
      
      // Adapt TokenPayload to UserContext role structures
      const userContext: UserContext = {
        userId: decodedPayload.userId,
        // Map MANAGER role to HOTEL corresponding scope and OPERATOR to client if needed
        role: decodedPayload.role === 'MANAGER' ? 'HOTEL' : 'CLIENT',
        hotelId: (decodedPayload as any).hotelId || 'default-hotel'
      };

      ws.userContext = userContext;
      ws.isAlive = true;

      logger.info({
        userId: userContext.userId,
        role: userContext.role,
        hotelId: userContext.hotelId,
      }, 'WS: Connection secured and authorized');

      clients.add(ws);

      ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        data: {
          message: 'Secure Connection established with clearance',
          context: {
            role: userContext.role,
            hotelId: userContext.hotelId,
          },
        },
        timestamp: Date.now(),
      }));

      // Ping-pong for connection monitoring
      ws.on('pong', () => { ws.isAlive = true; });

      // Client messages
      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          handleClientMessage(ws, msg);
        } catch (err) {
          logger.error({ err: (err as Error).message }, 'WS: Error parsing message');
        }
      });

      ws.on('close', () => {
        clients.delete(ws);
        logger.info({ userId: userContext.userId }, 'WS: Connection closed safely');
      });

      ws.on('error', (err) => {
        logger.error({ err: err.message }, 'WS: Connection crashed with error');
        clients.delete(ws);
      });
    } catch (err: any) {
      logger.error({ err: err.message }, 'WS: Auth failed');
      ws.close(4002, 'Auth signature verification failed');
    }
  });

  // Keep-alive heartbeat routine
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
    // Elevate subscription context if authorized
    ws.send(JSON.stringify({ type: 'SUBSCRIBED', hotelId: msg.hotelId }));
  }
}

// ==========================================
// BROADCAST WITH MULTI-TENANT ISOLATION
// ==========================================

export const broadcastUpdate = (message: Omit<WSMessage, 'timestamp'>): void => {
  const payload = JSON.stringify({
    ...message,
    timestamp: Date.now(),
  });

  clients.forEach((ws) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    if (!ws.userContext) return;

    // Isolate routing deliveries based on tenant levels
    const isDeliverable = shouldDeliverToClient(ws.userContext, message);
    if (isDeliverable) {
      ws.send(payload);
    }
  });
};

function shouldDeliverToClient(ctx: UserContext, message: WSMessage): boolean {
  // If target hotelId is not constrained, let everyone receive
  if (!message.hotelId) return true;

  // Super admins have global visibility
  if (ctx.role === 'SUPER_ADMIN') return true;

  // Hotel staff receives isolated hotel orders
  if (ctx.role === 'HOTEL') {
    return ctx.hotelId === message.hotelId;
  }

  // Clients receive orders matched to their profile ids
  if (ctx.role === 'CLIENT') {
    if (message.type === 'ORDER_CREATED' || message.type === 'ORDER_STATUS_CHANGED') {
      return message.data?.guestId === ctx.userId;
    }
    return false;
  }

  return false;
}

export const getConnectedClientsCount = (): number => clients.size;
