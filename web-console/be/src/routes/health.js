const express = require('express');

function createHealthRouter({ runtimeState }) {
    const router = express.Router();

    router.get('/live', (_req, res) => {
        res.send({
            status: 'ok',
            uptime_seconds: Math.floor(process.uptime()),
        });
    });

    router.get('/ready', (_req, res) => {
        const state = runtimeState.getSnapshot();
        const ready = state.databaseReady && state.daasReady;

        res.status(ready ? 200 : 503).send({
            status: ready ? 'ready' : 'not_ready',
            checks: {
                database: state.databaseReady,
                daas: state.daasReady,
            },
            local_node: state.localDin === null ? null : {
                sid: state.localSid,
                din: state.localDin,
            },
            last_error: state.lastError,
        });
    });

    return router;
}

module.exports = {
    createHealthRouter,
};
