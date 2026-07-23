import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const consumerDirectory = await mkdtemp(path.join(tmpdir(), 'testgold-package-smoke-'));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: consumerDirectory,
    encoding: 'utf8',
    ...options
  });

  assert.equal(
    result.status,
    0,
    `${command} ${args.join(' ')} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  return result.stdout;
}

try {
  const packOutput = run('npm', [
    'pack',
    repositoryRoot,
    '--json',
    '--pack-destination',
    consumerDirectory
  ]);
  const [{ filename }] = JSON.parse(packOutput);
  const tarballPath = path.join(consumerDirectory, filename);

  run('npm', ['install', '--ignore-scripts', tarballPath]);

  const executable = path.join(
    consumerDirectory,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'testgold.cmd' : 'testgold'
  );
  const fixtures = path.join(repositoryRoot, 'fixtures');
  const cliOutput = run(executable, [
    'compare',
    '--actual',
    path.join(fixtures, 'text', 'actual.txt'),
    '--golden',
    path.join(fixtures, 'text', 'expected.txt'),
    '--config',
    path.join(fixtures, 'testgold.config.json'),
    '--summary-json'
  ]);
  assert.match(cliOutput, /"status": "passed"/);

  const moduleOutput = run('node', [
    '--input-type=module',
    '--eval',
    'import("testgold").then((module) => console.log(Object.keys(module).sort().join(",")))'
  ]);
  assert.match(moduleOutput, /\bcompareGolden\b/);
  assert.match(moduleOutput, /\bnormalizeFixture\b/);

  await writeFile(
    path.join(consumerDirectory, 'types-smoke.mts'),
    [
      "import { compareGolden, type CompareResult } from 'testgold';",
      'const result: Promise<CompareResult> = compareGolden({',
      "  actualPath: 'actual.txt',",
      "  goldenPath: 'golden.txt'",
      '});',
      'void result;',
      ''
    ].join('\n')
  );
  run(path.join(repositoryRoot, 'node_modules', '.bin', 'tsc'), [
    '--noEmit',
    '--strict',
    '--target',
    'ES2022',
    '--module',
    'NodeNext',
    '--moduleResolution',
    'NodeNext',
    'types-smoke.mts'
  ]);

  console.log('Installed package CLI, ESM exports, and TypeScript declarations passed.');
} finally {
  await rm(consumerDirectory, { recursive: true, force: true });
}
