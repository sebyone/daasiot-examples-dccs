const assert = require('node:assert/strict');
const test = require('node:test');

const daasApi = require('../src/daas/daas');

test('0.22 adapter reports package and platform support without loading unsupported binaries', () => {
    const version = daasApi.getVersion();

    assert.equal(version.daasSdkPackage, '0.22.0');
    assert.equal(version.supported, process.platform === 'linux' && process.arch === 'x64');
    if (!version.supported) {
        assert.equal(version.nativeLoaded, false);
    }
});
