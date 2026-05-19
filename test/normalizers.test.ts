import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';
import { normalizeText } from '../src/normalizers.js';

test('scrubs timestamps, UUIDs, and custom patterns', async () => {
  const config = await loadConfig('fixtures/testgold.config.json');
  const text = normalizeText('run-123 at 2026-05-19T08:13:42.123Z id=3d594650-3436-4d0d-98dd-711fe19e533b', config);
  assert.equal(text, 'run-<ID> at <ISO_DATE> id=<UUID>\n');
});

test('normalizes CRLF line endings', async () => {
  const config = await loadConfig();
  assert.equal(normalizeText('one\r\ntwo', config), 'one\ntwo\n');
});
