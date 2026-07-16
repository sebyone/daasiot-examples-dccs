function createRuntimeState() {
    const state = {
        databaseReady: false,
        daasReady: false,
        localSid: null,
        localDin: null,
        startedAt: null,
        lastError: null,
    };

    return {
        getSnapshot() {
            return { ...state };
        },
        markDatabaseReady() {
            state.databaseReady = true;
        },
        markStarted() {
            state.startedAt = new Date().toISOString();
        },
        markDaasReady({ sid, din }) {
            state.daasReady = true;
            state.localSid = sid;
            state.localDin = din;
            state.lastError = null;
        },
        markDaasUnavailable(error) {
            state.daasReady = false;
            state.lastError = error instanceof Error ? error.message : String(error);
        },
        markStopped() {
            state.daasReady = false;
        },
    };
}

module.exports = {
    createRuntimeState,
};
