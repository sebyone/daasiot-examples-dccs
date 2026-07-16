const express = require('express');
const { sendError } = require('./utilities');

function serializePayload(payload) {
    if (Buffer.isBuffer(payload) || typeof payload === 'string') {
        return payload;
    }
    return JSON.stringify(payload ?? '');
}

function createConfigAndLifecycleRouter({
    daasApi,
    daasService,
    ddoService,
    database,
    runtimeState,
}) {
    const router = express.Router();

    router.get('/', (_req, res) => {
        res.send({
            name: 'DaasIoT API',
            version: 1,
            message: 'OK',
        });
    });

    router.post('/configure', async (_req, res) => {
        try {
            const config = await daasService.loadConfig(daasApi.getNode());
            if (!config) {
                res.status(404);
                throw new Error('Configurazione del nodo locale non trovata.');
            }
            runtimeState.markDaasReady(config);
            res.send({ message: 'Configurazione applicata.', config });
        } catch (error) {
            runtimeState.markDaasUnavailable(error);
            sendError(res, error);
        }
    });

    router.post('/stop', (_req, res) => {
        try {
            const stopped = daasApi.stop();
            if (!stopped) {
                throw new Error('Impossibile fermare il nodo.');
            }
            runtimeState.markStopped();
            res.send({ message: 'Nodo fermato.' });
        } catch (error) {
            sendError(res, error);
        }
    });

    router.post('/start', async (_req, res) => {
        try {
            const config = await daasService.loadConfig(daasApi.getNode());
            if (!config) {
                res.status(404);
                throw new Error('Configurazione del nodo locale non trovata.');
            }

            const started = daasApi.start();
            if (!started) {
                throw new Error('Impossibile avviare il nodo.');
            }

            runtimeState.markDaasReady(config);
            res.send({ message: 'Nodo locale avviato.', config });
        } catch (error) {
            runtimeState.markDaasUnavailable(error);
            sendError(res, error);
        }
    });

    router.post('/restart', async (_req, res) => {
        try {
            daasApi.stop();
            const config = await daasService.loadConfig(daasApi.getNode());
            if (!config) {
                res.status(404);
                throw new Error('Configurazione del nodo locale non trovata.');
            }

            const started = daasApi.start();
            if (!started) {
                throw new Error('Impossibile riavviare il nodo.');
            }

            runtimeState.markDaasReady(config);
            res.send({ message: 'Nodo locale riavviato.', config });
        } catch (error) {
            runtimeState.markDaasUnavailable(error);
            sendError(res, error);
        }
    });

    router.post('/send', async (req, res) => {
        try {
            const din = Number.parseInt(req.body.din, 10);
            const typeset = Number.parseInt(req.body.typeset, 10);
            if (!Number.isInteger(din) || !Number.isInteger(typeset)) {
                res.status(400);
                throw new Error('din e typeset devono essere numeri interi.');
            }

            const payload = serializePayload(req.body.payload);
            const timestampSeconds = Math.floor(Date.now() / 1000);
            const { localDin } = runtimeState.getSnapshot();
            if (localDin === null) {
                res.status(503);
                throw new Error('Il nodo DaaS locale non è pronto.');
            }

            await daasApi.send(din, typeset, Buffer.from(payload).toString('base64'));
            const ddo = await ddoService.createDDO(localDin, din, payload, timestampSeconds, typeset);
            if (!ddo) {
                throw new Error('Impossibile salvare il DDO inviato.');
            }

            res.status(201).send(ddo);
        } catch (error) {
            sendError(res, error);
        }
    });

    router.get('/status', (_req, res) => {
        try {
            res.send(daasApi.getStatus());
        } catch (error) {
            runtimeState.markDaasUnavailable(error);
            sendError(res, error, 503);
        }
    });

    router.get('/version', (_req, res) => {
        res.send(daasApi.getVersion());
    });

    router.post('/dev/db_sync', async (req, res) => {
        try {
            if (process.env.NODE_ENV !== 'development') {
                res.status(403);
                throw new Error('Database sync disponibile solo in development.');
            }

            const force = req.body.force === true;
            await database.sequelize.sync({ force });
            res.send({ message: 'Database sincronizzato.', force });
        } catch (error) {
            sendError(res, error);
        }
    });

    return router;
}

module.exports = {
    createConfigAndLifecycleRouter,
    serializePayload,
};
