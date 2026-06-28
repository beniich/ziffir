/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */
import { Server as SocketServer, type Socket } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import { verifyAccessToken } from './domains/identity/auth/jwt.js';
import { COOKIE_NAME } from './utils/cookies.js';
import { prisma } from './infrastructure/database/prisma.client.js';

type AuthedSocket = Socket & {
  data: {
    userId: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'STAFF';
    hotelId: string;
  };
};

// Map pour éviter de re-parser le cookie à chaque handshake
function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k && v.length) out[k] = decodeURIComponent(v.join('='));
  }
  return out;
}

export function createSocketServer(httpServer: HttpServer, corsOrigin: string) {
  const io = new SocketServer(httpServer, {
    cors: { origin: corsOrigin, credentials: true },
    path: '/socket.io',
  });

  // Middleware d'auth : vérifie le JWT dans le cookie AVANT la connexion
  io.use((socket, next) => {
    try {
      const cookies = parseCookieHeader(socket.handshake.headers.cookie);
      const token = cookies[COOKIE_NAME];
      if (!token) return next(new Error('UNAUTHORIZED'));

      const payload = verifyAccessToken(token);
      (socket as AuthedSocket).data = payload;
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const s = socket as AuthedSocket;
    const { hotelId, role, userId } = s.data;

    // Chaque user rejoint la room de son hôtel (multi-tenant)
    s.join(`hotel:${hotelId}`);
    // Les admins rejoignent aussi une room "admin" globale pour les notifs système
    if (role === 'ADMIN') s.join('admins');

    console.log(`🟢 socket connected: user=${userId} hotel=${hotelId} role=${role}`);

    // Le client peut s'abonner explicitement à un événement (room status, tasks, etc.)
    s.on('subscribe', (channel: 'rooms' | 'tasks' | 'minibar' | 'parking') => {
      if (['rooms', 'tasks', 'minibar', 'parking'].includes(channel)) {
        s.join(`hotel:${hotelId}:${channel}`);
      }
    });

    s.on('unsubscribe', (channel: 'rooms' | 'tasks' | 'minibar' | 'parking') => {
      s.leave(`hotel:${hotelId}:${channel}`);
    });

    s.on('disconnect', (reason) => {
      console.log(`🔴 socket disconnected: user=${userId} reason=${reason}`);
    });
  });

  return io;
}

// Helpers utilisés par les controllers pour broadcaster
export const socketEvents = {
  roomUpdated: (io: SocketServer, hotelId: string, room: unknown) => {
    io.to(`hotel:${hotelId}`).emit('room:updated', room);
    io.to(`hotel:${hotelId}:rooms`).emit('room:updated', room);
  },
  roomCreated: (io: SocketServer, hotelId: string, room: unknown) => {
    io.to(`hotel:${hotelId}`).emit('room:created', room);
  },
  roomDeleted: (io: SocketServer, hotelId: string, roomId: string) => {
    io.to(`hotel:${hotelId}`).emit('room:deleted', { id: roomId });
  },
  taskCreated: (io: SocketServer, hotelId: string, task: unknown) => {
    io.to(`hotel:${hotelId}`).emit('task:created', task);
  },
  taskUpdated: (io: SocketServer, hotelId: string, task: unknown) => {
    io.to(`hotel:${hotelId}`).emit('task:updated', task);
  },
  taskDeleted: (io: SocketServer, hotelId: string, taskId: string) => {
    io.to(`hotel:${hotelId}`).emit('task:deleted', { id: taskId });
  },
  minibarItemCreated: (io: SocketServer, hotelId: string, item: unknown) => {
    io.to(`hotel:${hotelId}`).emit('minibar:created', item);
  },
  minibarItemUpdated: (io: SocketServer, hotelId: string, item: unknown) => {
    io.to(`hotel:${hotelId}`).emit('minibar:updated', item);
  },
  minibarItemDeleted: (io: SocketServer, hotelId: string, itemId: string) => {
    io.to(`hotel:${hotelId}`).emit('minibar:deleted', { id: itemId });
  },
  notify: (io: SocketServer, hotelId: string, payload: { type: string; title: string; message: string; level: 'info' | 'success' | 'warning' | 'error' }) => {
    io.to(`hotel:${hotelId}`).emit('notification', payload);
  },
};
