import test from 'node:test';
import assert from 'node:assert/strict';
import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

test('recorded orchestration smoke command executes successfully', async () => {
  const orchestration = JSON.parse(await readFile('docs/orchestration.json', 'utf8')) as {
    smoke: { command: string; expectedStatus: string };
  };
  const markdown = await readFile('docs/ORCHESTRATION.md', 'utf8');
  const markdownCommand = markdown.match(/^node .*--summary-json$/m)?.[0];

  assert.equal(markdownCommand, orchestration.smoke.command);

  const result = await execAsync(orchestration.smoke.command);
  const summary = JSON.parse(result.stdout) as { status: string };
  assert.equal(summary.status, orchestration.smoke.expectedStatus);
  assert.equal(summary.status, 'passed');
});
