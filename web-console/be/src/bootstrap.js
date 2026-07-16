const http = require('http');

const { createApp } = require('./app');
const database = require('./db/models');
const daasApi = require('./daas/daas');
const daasService = require('./services/daas.service');
const ddoService = require('./services/ddo.service');
const { attachDaasRuntime } = require('./runtime/daas-runtime');
const { createRuntimeState } = require('./runtime/state');
const { attachWebSocketServer } = require('./websocket');

function normalizePort(value) {
    const port = Number.parseInt(value, 10);
    return Number.isNaN(port) ? value : port >= 0 ? port : false;
}

function listen(server, port, host) {
    return new Promise((resolve, reject) => {
        const onError = (error) => {
            server.off('listening', onListening);
            reject(error);
        };
        const onListening = () => {
            server.off('error', onError);
            resolve(server.address());
        };

        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(port, host);
    });
}

function closeHttpServer(server) {
    return new Promise((resolve, reject) => {
        if (!server.listening) {
            resolve();
            return;
        }

        server.close((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

async function startServer({
    port = normalizePort(process.env.PORT || '3000'),
    host = process.env.HOST,
    dependencies = {},
} = {}) {
    const resolvedDatabase = dependencies.database || database;
    const resolvedDaasApi = dependencies.daasApi || daasApi;
    const resolvedDaasService = dependencies.daasService || daasService;
    const resolvedDdoService = dependencies.ddoService || ddoService;
    const runtimeState = dependencies.runtimeState || createRuntimeState();

    await resolvedDatabase.sequelize.authenticate();
    runtimeState.markDatabaseReady();

    const app = createApp({
        daasApi: resolvedDaasApi,
        daasService: resolvedDaasService,
        ddoService: resolvedDdoService,
        database: resolvedDatabase,
        runtimeState,
    });
    const server = http.createServer(app);
    const webSocket = attachWebSocketServer(server);
    const daasRuntime = attachDaasRuntime({
        daasApi: resolvedDaasApi,
        daasService: resolvedDaasService,
        ddoService: resolvedDdoService,
        runtimeState,
        broadcast: webSocket.broadcast,
    });

    const address = await listen(server, port, host);
    runtimeState.markStarted();

    try {
        await daasRuntime.start();
    } catch (error) {
        console.error('[daas] startup failed:', error.message);
    }

    let stopping = false;
    async function stop() {
        if (stopping) return;
        stopping = true;

        daasRuntime.stop();
        await webSocket.close();
        await closeHttpServer(server);
        await resolvedDatabase.sequelize.close();
    }

    return {
        address,
        app,
        runtimeState,
        server,
        stop,
        webSocket,
    };
}

module.exports = {
    normalizePort,
    startServer,
};
