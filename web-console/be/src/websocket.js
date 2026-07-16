const { WebSocket, WebSocketServer } = require('ws');
const { getTime } = require('./daas/utils');

function broadcastJson(clients, payload) {
    const message = JSON.stringify(payload);

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function attachWebSocketServer(server) {
    const webSocketServer = new WebSocketServer({ server });

    webSocketServer.on('connection', (socket) => {
        console.log(getTime(), 'WebSocket client connected');
        socket.send(JSON.stringify({ message: 'Connection established' }));

        socket.on('message', (data) => {
            webSocketServer.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data.toString());
                }
            });
        });
        socket.on('close', () => console.log(getTime(), 'WebSocket client disconnected'));
        socket.on('error', (error) => console.error(getTime(), 'WebSocket error:', error.message));
    });

    return {
        broadcast(payload) {
            broadcastJson(webSocketServer.clients, payload);
        },
        close() {
            return new Promise((resolve) => {
                webSocketServer.clients.forEach((client) => client.close(1001, 'Server shutting down'));
                webSocketServer.close(() => resolve());
            });
        },
        server: webSocketServer,
    };
}

module.exports = {
    attachWebSocketServer,
    broadcastJson,
};
