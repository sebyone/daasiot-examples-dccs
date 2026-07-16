const assert = require('node:assert/strict');
const test = require('node:test');

const daasApi = require('../src/daas/daas');

test('legacy adapter reports the pinned SDK without eagerly loading the addon', () => {
    const version = daasApi.getVersion();

    assert.equal(version.daasSdkPackage, '0.17.9');
    assert.equal(version.nativeLoaded, false);
});
