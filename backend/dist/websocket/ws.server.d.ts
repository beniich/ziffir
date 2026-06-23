import { WebSocketServer } from 'ws';
interface WSMessage {
    type: string;
    data: any;
    hotelId?: string;
    timestamp?: number;
}
export declare const initWebSocket: (server: any) => WebSocketServer;
export declare const broadcastUpdate: (message: Omit<WSMessage, "timestamp">) => void;
export declare const getConnectedClientsCount: () => number;
export {};
//# sourceMappingURL=ws.server.d.ts.map