import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
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
//# sourceMappingURL=cli.test.js.map