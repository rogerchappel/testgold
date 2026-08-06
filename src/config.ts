import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { BuiltInScrubber, JsonMode, ScrubberConfig, TestGoldConfig } from './types.js';

const builtInScrubbers: readonly BuiltInScrubber[] = [
  'iso-date', 'epoch-ms', 'tmp-path', 'home-path', 'cwd', 'windows-path', 'uuid'
];
const jsonModes: readonly JsonMode[] = ['preserve', 'sort-keys', 'sort-arrays'];
const newlineModes = ['lf', 'preserve'] as const;

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
  let parsed: unknown;
  try {
    const raw = await readFile(resolved, 'utf8');
    parsed = JSON.parse(raw) as unknown;
    validateConfig(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Configuration error in ${resolved}: ${message}`);
  }

  const config = parsed as TestGoldConfig;

  return {
    scrubbers: config.scrubbers ?? [...defaultConfig.scrubbers],
    jsonMode: config.jsonMode ?? defaultConfig.jsonMode,
    newline: config.newline ?? defaultConfig.newline
  };
}

function validateConfig(value: unknown): asserts value is TestGoldConfig {
  if (!isObject(value)) {
    throw new Error('configuration must be a JSON object.');
  }

  if (value.scrubbers !== undefined) {
    if (!Array.isArray(value.scrubbers)) {
      throw new Error('"scrubbers" must be an array.');
    }
    value.scrubbers.forEach(validateScrubber);
  }

  if (value.jsonMode !== undefined && !jsonModes.includes(value.jsonMode as JsonMode)) {
    throw new Error('"jsonMode" must be one of preserve, sort-keys, or sort-arrays.');
  }
  if (value.newline !== undefined && !newlineModes.includes(value.newline as 'lf' | 'preserve')) {
    throw new Error('"newline" must be one of lf or preserve.');
  }
}

function validateScrubber(value: unknown, index: number): asserts value is ScrubberConfig {
  if (typeof value === 'string') {
    if (!builtInScrubbers.includes(value as BuiltInScrubber)) {
      throw new Error(`unknown built-in scrubber "${value}" at scrubbers[${index}].`);
    }
    return;
  }

  if (!isObject(value)) {
    throw new Error(`scrubbers[${index}] must be a built-in name or custom scrubber object.`);
  }
  if (typeof value.pattern !== 'string') {
    throw new Error(`scrubbers[${index}].pattern must be a string.`);
  }
  if (typeof value.replacement !== 'string') {
    throw new Error(`scrubbers[${index}].replacement must be a string.`);
  }
  if (value.name !== undefined && typeof value.name !== 'string') {
    throw new Error(`scrubbers[${index}].name must be a string.`);
  }
  if (value.flags !== undefined && typeof value.flags !== 'string') {
    throw new Error(`scrubbers[${index}].flags must be a string.`);
  }

  try {
    new RegExp(value.pattern, value.flags ?? 'g');
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`scrubbers[${index}] has an invalid regular expression: ${detail}`);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
