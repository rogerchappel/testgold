import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { TestGoldConfig } from './types.js';

const defaultConfig: Required<TestGoldConfig> = {
  scrubbers: ['iso-date', 'epoch-ms', 'tmp-path', 'home-path', 'cwd', 'windows-path', 'uuid'],
  jsonMode: 'sort-keys',
  newline: 'lf'
};

export async function loadConfig(configPath?: string): Promise<Required<TestGoldConfig>> {
  if (!configPath) {
    return { ...defaultConfig, scrubbers: [...defaultConfig.scrubbers] };
  }

  const resolved = path.resolve(configPath);
  const raw = await readFile(resolved, 'utf8');
  const parsed = JSON.parse(raw) as TestGoldConfig;

  return {
    scrubbers: parsed.scrubbers ?? defaultConfig.scrubbers,
    jsonMode: parsed.jsonMode ?? defaultConfig.jsonMode,
    newline: parsed.newline ?? defaultConfig.newline
  };
}
