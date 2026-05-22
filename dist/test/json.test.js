import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeJson } from '../src/json.js';
test('sorts object keys recursively', () => {
    assert.equal(normalizeJson('{"z":3,"a":{"b":2,"a":1}}', 'sort-keys'), '{\n  "a": {\n    "a": 1,\n    "b": 2\n  },\n  "z": 3\n}\n');
});
test('sorts arrays by stable object representation when requested', () => {
    const actual = normalizeJson('[{"name":"beta","id":2},{"id":1,"name":"alpha"}]', 'sort-arrays');
    assert.equal(actual, '[\n  {\n    "id": 1,\n    "name": "alpha"\n  },\n  {\n    "id": 2,\n    "name": "beta"\n  }\n]\n');
});
//# sourceMappingURL=json.test.js.map