const assert = require('node:assert/strict');
const test = require('node:test');

const { createRuntimeState } = require('../src/runtime/state');
const { serializePayload } = require('../src/routes/api/configAndLifecycle');
const { startServer } = require('../src/bootstrap');

function createFakeDependencies() {
    const calls = {
        authenticate: 0,
        close: 0,
        start: 0,
        stop: 0,
    };
    let ddoCallback = null;

    const node = {
        doInit: () => true,
        enableDriver: () => true,
        map: () => true,
        onDDOReceived(callback) {
            ddoCallback = callback;
        },
        getStatus: () => ({ linked: 1 }),
        getVersion: () => ({ version: 'test' }),
    };

    return {
        calls,
        database: {
            sequelize: {
                async authenticate() {
                    calls.authenticate += 1;
                },
                async close() {
                    calls.close += 1;
                },
                async sync() {},
            },
        },
        daasApi: {
            getNode: () => node,
            getStatus: () => ({ linked: 1 }),
            getVersion: () => ({ version: 'test' }),
            start() {
                calls.start += 1;
                return true;
            },
            stop() {
                calls.stop += 1;
                return true;
            },
            send: async () => true,
        },
        daasService: {
            loadConfig: async () => ({ sid: 100, din: 101 }),
        },
        ddoService: {
            createDDO: async () => ({ id: 1 }),
        },
        getDdoCallback: () => ddoCallback,
    };
}

test('payload serialization supports strings, buffers and JSON objects', () => {
    assert.equal(serializePayload('hello'), 'hello');
    assert.deepEqual(serializePayload(Buffer.from('hello')), Buffer.from('hello'));
    assert.equal(serializePayload({ status: true }), '{"status":true}');
});

test('backend starts without schema sync, reports readiness and shuts down cleanly', async (t) => {
    const dependencies = createFakeDependencies();
    const runtimeState = createRuntimeState();
    const runtime = await startServer({
        port: 0,
        dependencies: {
            ...dependencies,
            runtimeState,
        },
    });
    t.after(() => runtime.stop());

    const port = runtime.address.port;
    const liveResponse = await fetch(`http://127.0.0.1:${port}/health/live`);
    const readyResponse = await fetch(`http://127.0.0.1:${port}/health/ready`);
    const apiResponse = await fetch(`http://127.0.0.1:${port}/api`);

    assert.equal(liveResponse.status, 200);
    assert.equal(readyResponse.status, 200);
    assert.deepEqual((await readyResponse.json()).checks, {
        database: true,
        daas: true,
    });
    assert.equal(apiResponse.status, 200);
    assert.equal(dependencies.calls.authenticate, 1);
    assert.equal(dependencies.calls.start, 1);
    assert.equal(typeof dependencies.getDdoCallback(), 'function');

    await runtime.stop();
    assert.equal(dependencies.calls.stop, 1);
    assert.equal(dependencies.calls.close, 1);
});

test('readiness is 503 when DaaS configuration cannot be loaded', async (t) => {
    const dependencies = createFakeDependencies();
    dependencies.daasService.loadConfig = async () => null;

    const runtime = await startServer({
        port: 0,
        dependencies,
    });
    t.after(() => runtime.stop());

    const response = await fetch(`http://127.0.0.1:${runtime.address.port}/health/ready`);
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.checks.database, true);
    assert.equal(body.checks.daas, false);
    assert.match(body.last_error, /configuration not found/i);
});
