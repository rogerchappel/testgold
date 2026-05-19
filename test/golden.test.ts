import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { compareGolden } from '../src/golden.js';

test('passes matching normalized text fixtures', async () => {
  const result = await compareGolden({
    actualPath: 'fixtures/text/actual.txt',
    goldenPath: 'fixtures/text/expected.txt',
    configPath: 'fixtures/testgold.config.json'
  });
  assert.equal(result.status, 'passed');
  assert.equal(result.changed, false);
});

test('fails changed fixtures with a diff', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'testgold-'));
  const actual = path.join(temp, 'actual.txt');
  const golden = path.join(temp, 'expected.txt');
  await writeFile(actual, 'hello\nnew\n', 'utf8');
  await writeFile(golden, 'hello\nold\n', 'utf8');

  const result = await compareGolden({ actualPath: actual, goldenPath: golden });
  assert.equal(result.status, 'failed');
  assert.match(result.diff, /-old\n\+new/);
});

test('accepts changed fixtures explicitly', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'testgold-'));
  const actual = path.join(temp, 'actual.txt');
  const golden = path.join(temp, 'expected.txt');
  await writeFile(actual, 'accepted\n', 'utf8');
  await writeFile(golden, 'previous\n', 'utf8');

  const result = await compareGolden({ actualPath: actual, goldenPath: golden, accept: true });
  assert.equal(result.status, 'accepted');
  assert.equal(await readFile(golden, 'utf8'), 'accepted\n');
});

test('creates missing goldens with accept', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'testgold-'));
  const actual = path.join(temp, 'actual.txt');
  const golden = path.join(temp, 'nested', 'expected.txt');
  await writeFile(actual, 'created\n', 'utf8');

  const result = await compareGolden({ actualPath: actual, goldenPath: golden, accept: true });
  assert.equal(result.status, 'created');
  assert.equal(await readFile(golden, 'utf8'), 'created\n');
});

test('passes JSON fixtures after key and array normalization', async () => {
  const result = await compareGolden({
    actualPath: 'fixtures/json/actual.json',
    goldenPath: 'fixtures/json/expected.json',
    configPath: 'fixtures/testgold.config.json'
  });
  assert.equal(result.status, 'passed');
});
