"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectedClientsCount = exports.broadcastUpdate = exports.initWebSocket = void 0;
const ws_1 = require("ws");
const url_1 = require("url");
const auth_service_1 = require("../services/auth.service");
const logger = { info: console.log, error: console.error };
let wss = null;
const clients = new Set();
const initWebSocket = (server) => {
    wss = new ws_1.WebSocketServer({ server, path: '/ws' });
    wss.on('connection', (ws, req) => {
        try {
            const url = new url_1.URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const token = url.searchParams.get('token');
            if (!token) {
                ws.close(4001, 'Token manquant');
                return;
            }
            const decoded = auth_service_1.AuthService.verifyAccessToken(token);
            ws.userContext = decoded;
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
                }
                catch (err) {
                    logger.error({ err: err.message }, 'WS: Parse error');
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
        }
        catch (err) {
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
exports.initWebSocket = initWebSocket;
function handleClientMessage(ws, msg) {
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
const broadcastUpdate = (message) => {
    const payload = JSON.stringify({
        ...message,
        timestamp: Date.now(),
    });
    clients.forEach((ws) => {
        if (ws.readyState !== ws_1.WebSocket.OPEN)
            return;
        if (!ws.userContext)
            return;
        const shouldDeliver = shouldReceiveMessage(ws.userContext, message);
        if (shouldDeliver) {
            ws.send(payload);
        }
    });
};
exports.broadcastUpdate = broadcastUpdate;
function shouldReceiveMessage(ctx, message) {
    if (!message.hotelId)
        return true;
    if (ctx.role === 'SUPER_ADMIN')
        return true;
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
const getConnectedClientsCount = () => clients.size;
exports.getConnectedClientsCount = getConnectedClientsCount;
//# sourceMappingURL=ws.server.js.map