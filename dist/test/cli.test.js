import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
const execFileAsync = promisify(execFile);
test('CLI returns JSON summary for passing fixture', async () => {
    const result = await execFileAsync('node', [
        'dist/src/cli.js',
        'compare',
        '--actual',
        'fixtures/text/actual.txt',
        '--golden',
        'fixtures/text/expected.txt',
        '--config',
        'fixtures/testgold.config.json',
        '--summary-json'
    ]);
    const summary = JSON.parse(result.stdout);
    assert.equal(summary.status, 'passed');
    assert.equal(summary.changed, false);
});
test('CLI keeps a failing JSON summary parseable and writes the diff to stderr', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'testgold-cli-json-'));
    const actualPath = path.join(directory, 'actual.txt');
    const goldenPath = path.join(directory, 'golden.txt');
    await writeFile(actualPath, 'actual\n');
    await writeFile(goldenPath, 'golden\n');
    await assert.rejects(execFileAsync('node', [
        'dist/src/cli.js',
        'compare',
        '--actual',
        actualPath,
        '--golden',
        goldenPath,
        '--summary-json'
    ]), (error) => {
        const result = error;
        const summary = JSON.parse(result.stdout);
        assert.equal(result.code, 1);
        assert.equal(summary.status, 'failed');
        assert.equal(summary.changed, true);
        assert.match(result.stderr, /--- .*golden\.txt/);
        assert.match(result.stderr, /\+actual/);
        return true;
    });
});
test('CLI writes a human-readable diff to stdout without --summary-json', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'testgold-cli-human-'));
    const actualPath = path.join(directory, 'actual.txt');
    const goldenPath = path.join(directory, 'golden.txt');
    await writeFile(actualPath, 'actual\n');
    await writeFile(goldenPath, 'golden\n');
    await assert.rejects(execFileAsync('node', [
        'dist/src/cli.js',
        'compare',
        '--actual',
        actualPath,
        '--golden',
        goldenPath
    ]), (error) => {
        const result = error;
        assert.equal(result.code, 1);
        assert.match(result.stdout, /status: failed/);
        assert.match(result.stdout, /--- .*golden\.txt/);
        assert.match(result.stdout, /\+actual/);
        assert.equal(result.stderr, '');
        return true;
    });
});
test('CLI reports a misspelled built-in scrubber as a configuration error before comparison', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'testgold-cli-config-'));
    const configPath = path.join(directory, 'config.json');
    await writeFile(configPath, JSON.stringify({ scrubbers: ['iso-dat'] }));
    await assert.rejects(execFileAsync('node', [
        'dist/src/cli.js',
        'compare',
        '--actual',
        'fixtures/timestamp/actual.txt',
        '--golden',
        'fixtures/timestamp/expected.txt',
        '--config',
        configPath
    ]), (error) => {
        const result = error;
        assert.equal(result.code, 1);
        assert.equal(result.stdout, '');
        assert.match(result.stderr, /Configuration error in .*config\.json: unknown built-in scrubber "iso-dat"/);
        return true;
    });
});
//# sourceMappingURL=cli.test.js.map