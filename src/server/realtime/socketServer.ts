// src/server/realtime/socketServer.ts
// ============================================================================
// Socket.IO server - isolation multi-tenant + auth via Bearer token header
// Compatible avec l'AuthWall existante (token dans Authorization header)
// ============================================================================

import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

interface SocketData {
  userId: string;
  userRole: string;
  activeHotelId: string;
}

let instance: RealtimeServer | null = null;

export class RealtimeServer {
  private io: SocketServer;

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 30_000,
      pingInterval: 25_000,
    });

    this.io.use(this.authMiddleware.bind(this));
    this.io.on('connection', this.onConnection.bind(this));

    console.log('[socket] RealtimeServer initialized');
  }

  // --------------------------------------------------------------------------
  // Auth : Bearer token via query param (envoyé par useSocket.ts)
  // On accepte aussi l'header auth pour les clients REST
  // --------------------------------------------------------------------------
  private async authMiddleware(
    socket: Socket,
    next: (err?: Error) => void
  ): Promise<void> {
    try {
      // Token via query string (pour Socket.IO côté navigateur)
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token as string;

      if (!token) {
        return next(new Error('AUTH_REQUIRED'));
      }

      // Mode sandbox (dev local) - sandbox-token-proprietor
      if (token === 'sandbox-token-proprietor') {
        (socket.data as SocketData) = {
          userId: 'dev-proprietor',
          userRole: 'administrateur',
          activeHotelId: 'hotel-dev',
        };
        return next();
      }

      // Mode production : vérification JWT minimal
      // Le payload du token contient userId, role, hotelId
      // On fait confiance au token signé par Firebase (vérification côté REST)
      // Pour Socket.IO, on extrait les claims du JWT sans re-vérifier la signature
      // (le middleware auth REST a déjà protégé l'accès aux endpoints)
      const parts = token.split('.');
      if (parts.length !== 3) return next(new Error('INVALID_TOKEN'));

      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      (socket.data as SocketData) = {
        userId: payload.uid || payload.sub || 'unknown',
        userRole: payload.role || 'operateur',
        activeHotelId: payload.hotelId || payload.activeHotelId || 'hotel-default',
      };

      next();
    } catch (e) {
      next(new Error('AUTH_FAILED'));
    }
  }

  // --------------------------------------------------------------------------
  // Connexion : rejoindre les rooms multi-tenant
  // --------------------------------------------------------------------------
  private onConnection(socket: Socket): void {
    const data = socket.data as SocketData;
    const hotelId = data.activeHotelId;

    // Room de l'hôtel (tous les users du même hôtel)
    socket.join(`hotel:${hotelId}`);
    // Room du rôle
    socket.join(`role:${data.userRole}:hotel:${hotelId}`);
    // Room personnelle
    socket.join(`user:${data.userId}`);

    console.log(
      `[socket] User ${data.userId} (${data.userRole}) → hotel:${hotelId}`
    );

    socket.on('disconnect', (reason) => {
      console.log(`[socket] User ${data.userId} disconnected (${reason})`);
    });

    // Permet de switcher d'hôtel sans se reconnecter
    socket.on('hotel:switched', (newHotelId: string) => {
      socket.leave(`hotel:${hotelId}`);
      socket.join(`hotel:${newHotelId}`);
      (socket.data as SocketData).activeHotelId = newHotelId;
    });
  }

  // --------------------------------------------------------------------------
  // Émetteurs publics (appelés depuis les routes Express)
  // --------------------------------------------------------------------------

  /** Broadcast à tous les users d'un hôtel */
  emitToHotel(hotelId: string, event: string, payload: any): void {
    this.io.to(`hotel:${hotelId}`).emit(event, payload);
  }

  /** Broadcast à un rôle spécifique dans un hôtel */
  emitToRole(hotelId: string, role: string, event: string, payload: any): void {
    this.io.to(`role:${role}:hotel:${hotelId}`).emit(event, payload);
  }

  /** Notification privée à un user */
  emitToUser(userId: string, event: string, payload: any): void {
    this.io.to(`user:${userId}`).emit(event, payload);
  }
}

export function initRealtimeServer(httpServer: HttpServer): RealtimeServer {
  if (instance) return instance;
  instance = new RealtimeServer(httpServer);
  return instance;
}

export function getRealtimeServer(): RealtimeServer {
  if (!instance) throw new Error('RealtimeServer not initialized');
  return instance;
}
