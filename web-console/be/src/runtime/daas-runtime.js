const { decode, getTime } = require('../daas/utils');

function attachDaasRuntime({
    daasApi,
    daasService,
    ddoService,
    runtimeState,
    broadcast,
}) {
    let localNode = null;
    let nodeStarted = false;
    let listenerAttached = false;

    function attachListener() {
        if (listenerAttached) return;

        localNode.onDDOReceived((din) => {
            console.log(getTime(), 'DDO received from DIN:', din);
            localNode.locate(din);

            localNode.pull(din, async (origin, timestamp, typeset, data) => {
                try {
                    const decodedData = decode(data);
                    const { localDin } = runtimeState.getSnapshot();

                    if (localDin === null) {
                        throw new Error('Local DIN is not available.');
                    }

                    const ddo = await ddoService.createDDO(origin, localDin, data, timestamp, typeset);
                    if (!ddo) {
                        throw new Error('Failed to save DDO to database.');
                    }

                    broadcast({ event: 'ddo', data: { din, typeset, ddo: decodedData } });
                } catch (error) {
                    console.error(getTime(), 'DDO processing failed:', error);
                }
            });
        });

        listenerAttached = true;
    }

    async function start() {
        try {
            localNode = daasApi.getNode();
            attachListener();
            const config = await daasService.loadConfig(localNode);
            if (!config) {
                throw new Error('Local DaaS configuration not found.');
            }

            const started = daasApi.start();
            if (!started) {
                throw new Error('DaaS node could not be started.');
            }
            nodeStarted = true;

            runtimeState.markDaasReady(config);
            console.log(getTime(), `[daas] local node ready: sid=${config.sid} din=${config.din}`);
            return config;
        } catch (error) {
            if (nodeStarted) {
                try {
                    daasApi.stop();
                } catch (stopError) {
                    console.error(getTime(), '[daas] cleanup after failed startup failed:', stopError);
                }
                nodeStarted = false;
            }
            runtimeState.markDaasUnavailable(error);
            throw error;
        }
    }

    function stop() {
        if (nodeStarted) {
            daasApi.stop();
            nodeStarted = false;
        }
        runtimeState.markStopped();
    }

    return {
        start,
        stop,
    };
}

module.exports = {
    attachDaasRuntime,
};
