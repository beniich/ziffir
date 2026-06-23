"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocketServer = initWebSocketServer;
exports.broadcast = broadcast;
const ws_1 = require("ws");
let wss = null;
function initWebSocketServer(server) {
    wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws) => {
        console.log('Client connected to WebSocket server');
        ws.on('message', (message) => {
            console.log('Received message:', message.toString());
        });
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
}
function broadcast(event, data) {
    if (!wss)
        return;
    const payload = JSON.stringify({ event, data });
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(payload);
        }
    });
}
//# sourceMappingURL=ws.js.map