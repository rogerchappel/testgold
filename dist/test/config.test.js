import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';
test('loads default config without a file', async () => {
    const config = await loadConfig();
    assert.equal(config.jsonMode, 'sort-keys');
    assert.equal(config.newline, 'lf');
    assert.ok(config.scrubbers.includes('iso-date'));
});
test('merges user config with defaults', async () => {
    const config = await loadConfig('fixtures/testgold.config.json');
    assert.equal(config.jsonMode, 'sort-arrays');
    assert.equal(config.newline, 'lf');
    assert.equal(config.scrubbers.length, 8);
});
//# sourceMappingURL=config.test.js.map