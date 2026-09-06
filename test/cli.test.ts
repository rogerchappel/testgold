import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packageMetadata = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8')) as { version: string };

const expectedHelp = `testgold ${packageMetadata.version}

Usage:
  testgold compare --actual <path> --golden <path> [options]

Options:
  --accept            Write the normalized actual output to the golden file.
  --config <path>     JSON config with scrubbers and JSON normalization mode.
  --format <mode>     auto, text, or json. Defaults to auto.
  --summary-json      Print only a machine-readable JSON summary to stdout.
  -h, --help          Show this help.
  -v, --version       Show version.
`;

test('CLI version follows package metadata', async (t) => {
  const probeRoot = await mkdtemp(path.join(tmpdir(), 'testgold-cli-version-'));
  t.after(() => rm(probeRoot, { recursive: true, force: true }));
  await cp(path.join(repositoryRoot, 'dist', 'src'), path.join(probeRoot, 'dist', 'src'), { recursive: true });
  await writeFile(path.join(probeRoot, 'package.json'), JSON.stringify({ type: 'module', version: '0.1.1' }));

  const result = await execFileAsync('node', [path.join(probeRoot, 'dist', 'src', 'cli.js'), '--version']);

  assert.equal(result.stdout.trim(), '0.1.1');
  assert.equal(result.stderr, '');
});

for (const helpArgument of ['--help', 'help']) {
  test(`CLI renders formatted help for ${helpArgument}`, async () => {
    const result = await execFileAsync('node', ['dist/src/cli.js', helpArgument]);

    assert.equal(result.stdout, expectedHelp);
    assert.equal(result.stderr, '');
    assert.equal(result.stdout.includes('\\n'), false);
  });
}

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
  const summary = JSON.parse(result.stdout) as { status: string; changed: boolean };
  assert.equal(summary.status, 'passed');
  assert.equal(summary.changed, false);
});

test('CLI keeps a failing JSON summary parseable and writes the diff to stderr', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'testgold-cli-json-'));
  const actualPath = path.join(directory, 'actual.txt');
  const goldenPath = path.join(directory, 'golden.txt');
  await writeFile(actualPath, 'actual\n');
  await writeFile(goldenPath, 'golden\n');

  await assert.rejects(
    execFileAsync('node', [
      'dist/src/cli.js',
      'compare',
      '--actual',
      actualPath,
      '--golden',
      goldenPath,
      '--summary-json'
    ]),
    (error: unknown) => {
      const result = error as { code: number; stdout: string; stderr: string };
      const summary = JSON.parse(result.stdout) as { status: string; changed: boolean };
      assert.equal(result.code, 1);
      assert.equal(summary.status, 'failed');
      assert.equal(summary.changed, true);
      assert.match(result.stderr, /--- .*golden\.txt/);
      assert.match(result.stderr, /\+actual/);
      return true;
    }
  );
});

test('CLI writes a human-readable diff to stdout without --summary-json', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'testgold-cli-human-'));
  const actualPath = path.join(directory, 'actual.txt');
  const goldenPath = path.join(directory, 'golden.txt');
  await writeFile(actualPath, 'actual\n');
  await writeFile(goldenPath, 'golden\n');

  await assert.rejects(
    execFileAsync('node', [
      'dist/src/cli.js',
      'compare',
      '--actual',
      actualPath,
      '--golden',
      goldenPath
    ]),
    (error: unknown) => {
      const result = error as { code: number; stdout: string; stderr: string };
      assert.equal(result.code, 1);
      assert.match(result.stdout, /status: failed/);
      assert.match(result.stdout, /--- .*golden\.txt/);
      assert.match(result.stdout, /\+actual/);
      assert.equal(result.stderr, '');
      return true;
    }
  );
});

test('CLI reports a misspelled built-in scrubber as a configuration error before comparison', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'testgold-cli-config-'));
  const configPath = path.join(directory, 'config.json');
  await writeFile(configPath, JSON.stringify({ scrubbers: ['iso-dat'] }));

  await assert.rejects(
    execFileAsync('node', [
      'dist/src/cli.js',
      'compare',
      '--actual',
      'fixtures/timestamp/actual.txt',
      '--golden',
      'fixtures/timestamp/expected.txt',
      '--config',
      configPath
    ]),
    (error: unknown) => {
      const result = error as { code: number; stdout: string; stderr: string };
      assert.equal(result.code, 1);
      assert.equal(result.stdout, '');
      assert.match(result.stderr, /Configuration error in .*config\.json: unknown built-in scrubber "iso-dat"/);
      return true;
    }
  );
});
