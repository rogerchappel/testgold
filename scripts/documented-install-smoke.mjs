import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageMetadata = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
const readme = await readFile(path.join(repositoryRoot, 'README.md'), 'utf8');
const documentedCommand = 'npm install --save-dev github:rogerchappel/testgold';
assert.match(readme, new RegExp(documentedCommand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

const consumerDirectory = await mkdtemp(path.join(tmpdir(), 'testgold-documented-install-'));
try {
  const install = spawnSync('npm', ['install', '--save-dev', 'github:rogerchappel/testgold'], {
    cwd: consumerDirectory,
    encoding: 'utf8'
  });
  assert.equal(install.status, 0, install.stderr || install.stdout);

  const executable = path.join(consumerDirectory, 'node_modules', '.bin', process.platform === 'win32' ? 'testgold.cmd' : 'testgold');
  const version = spawnSync(executable, ['--version'], { cwd: consumerDirectory, encoding: 'utf8' });
  assert.equal(version.status, 0, version.stderr);
  assert.equal(version.stdout.trim(), packageMetadata.version);
  console.log(`Documented clean install resolved ${packageMetadata.name}@${packageMetadata.version}.`);
} finally {
  await rm(consumerDirectory, { recursive: true, force: true });
}
