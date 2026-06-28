import type { Server as SocketServer } from 'socket.io';

let ioInstance: SocketServer | null = null;

export function setIo(io: SocketServer) {
  ioInstance = io;
}

export function getIo(): SocketServer {
  if (!ioInstance) {
    throw new Error('Socket.io non initialisé — appel setIo() dans server.ts');
  }
  return ioInstance;
}
