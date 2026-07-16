const assert = require('node:assert/strict');
const test = require('node:test');

const { decode } = require('../src/daas/utils');
const {
    addQuery,
    getPaginationParams,
    getQuery,
    toPaginationData,
} = require('../src/routes/api/utilities');

test('decode converts a UTF-8 DDO payload to an object', () => {
    const payload = new TextEncoder().encode(JSON.stringify({ status: true, value: 42 }));
    assert.deepEqual(decode(payload), { status: true, value: 42 });
});

test('pagination applies defaults and safe boundaries', () => {
    assert.deepEqual(getPaginationParams({ query: {} }), { limit: 20, offset: 0 });
    assert.deepEqual(getPaginationParams({ query: { limit: '500', offset: '-3' } }), {
        limit: 50,
        offset: 0,
    });
    assert.deepEqual(getPaginationParams({ query: { limit: 'invalid', offset: 'invalid' } }), {
        limit: 20,
        offset: 0,
    });
});

test('pagination response exposes navigation metadata', () => {
    const result = toPaginationData({ rows: [{ id: 1 }, { id: 2 }], count: 4 }, 2, 0);
    assert.deepEqual(result.pagination, {
        limit: 2,
        offset: 0,
        count: 2,
        total: 4,
        has_next: true,
        has_prev: false,
    });
});

test('query helpers normalize arrays and preserve non-empty queries', () => {
    assert.equal(getQuery({ query: { q: ['lamp', 'ignored'] } }), 'lamp');
    assert.deepEqual(addQuery({ data: [] }, 'lamp'), { data: [], q: 'lamp' });
    assert.deepEqual(addQuery({ data: [] }, ''), { data: [] });
});
