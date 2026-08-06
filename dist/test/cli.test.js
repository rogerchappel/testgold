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