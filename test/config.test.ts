import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
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

test('accepts a valid custom scrubber', async () => {
  const config = await loadTemporaryConfig({
    scrubbers: [{ name: 'ticket', pattern: 'ticket-(\\d+)', replacement: 'ticket-<$1>', flags: 'gi' }]
  });

  assert.deepEqual(config.scrubbers, [
    { name: 'ticket', pattern: 'ticket-(\\d+)', replacement: 'ticket-<$1>', flags: 'gi' }
  ]);
});

const invalidConfigs: Array<[string, unknown, RegExp]> = [
  ['a non-object root', [], /configuration must be a JSON object/i],
  ['a non-array scrubbers value', { scrubbers: 'iso-date' }, /"scrubbers" must be an array/i],
  ['an unknown built-in scrubber', { scrubbers: ['iso-dat'] }, /unknown built-in scrubber "iso-dat"/i],
  ['an invalid jsonMode', { jsonMode: 'sort-values' }, /"jsonMode" must be one of preserve, sort-keys, or sort-arrays/i],
  ['an invalid newline mode', { newline: 'crlf' }, /"newline" must be one of lf or preserve/i],
  ['a custom scrubber without a pattern', { scrubbers: [{ replacement: 'x' }] }, /scrubbers\[0\]\.pattern must be a string/i],
  ['a custom scrubber without a replacement', { scrubbers: [{ pattern: 'x' }] }, /scrubbers\[0\]\.replacement must be a string/i],
  ['non-string custom scrubber flags', { scrubbers: [{ pattern: 'x', replacement: 'y', flags: 1 }] }, /scrubbers\[0\]\.flags must be a string/i],
  ['invalid custom scrubber flags', { scrubbers: [{ pattern: 'x', replacement: 'y', flags: 'gg' }] }, /scrubbers\[0\] has an invalid regular expression/i],
  ['an invalid custom scrubber pattern', { scrubbers: [{ pattern: '[', replacement: 'x' }] }, /scrubbers\[0\] has an invalid regular expression/i]
];

for (const [description, value, expected] of invalidConfigs) {
  test(`rejects ${description}`, async () => {
    await assert.rejects(loadTemporaryConfig(value), expected);
  });
}

async function loadTemporaryConfig(value: unknown) {
  const directory = await mkdtemp(path.join(tmpdir(), 'testgold-config-'));
  const configPath = path.join(directory, 'config.json');
  await writeFile(configPath, JSON.stringify(value));
  return loadConfig(configPath);
}
