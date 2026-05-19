import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadConfig } from './config.js';
import { diffStats, unifiedDiff } from './diff.js';
import { normalizeJson } from './json.js';
import { normalizeText } from './normalizers.js';
import type { CompareFormat, CompareOptions, CompareResult, NormalizedFixture, TestGoldConfig } from './types.js';

export async function compareGolden(options: CompareOptions): Promise<CompareResult> {
  const config = await loadConfig(options.configPath);
  const actualRaw = await readFile(options.actualPath, 'utf8');
  const format = resolveFormat(options.format ?? 'auto', options.actualPath);
  const actual = normalizeFixture(actualRaw, format, config);
  const goldenRaw = await readGolden(options.goldenPath);
  const golden = goldenRaw === undefined ? undefined : normalizeFixture(goldenRaw, format, config);
  const isMissing = golden === undefined;
  const changed = isMissing || golden.normalized !== actual.normalized;

  if (changed && options.accept) {
    await mkdir(path.dirname(options.goldenPath), { recursive: true });
    await writeFile(options.goldenPath, actual.normalized, 'utf8');
    const status = isMissing ? 'created' : 'accepted';
    return buildResult(status, options, format, true, '');
  }

  const diff = changed ? unifiedDiff(golden?.normalized ?? '', actual.normalized, options.goldenPath, options.actualPath) : '';
  const status = changed ? 'failed' : 'passed';
  return buildResult(status, options, format, changed, diff);
}

export function normalizeFixture(raw: string, format: Exclude<CompareFormat, 'auto'>, config: Required<TestGoldConfig>): NormalizedFixture {
  const text = normalizeText(raw, config);
  if (format === 'json') {
    return {
      raw,
      normalized: normalizeJson(text, config.jsonMode),
      format
    };
  }

  return {
    raw,
    normalized: text,
    format
  };
}

function buildResult(
  status: CompareResult['status'],
  options: CompareOptions,
  format: Exclude<CompareFormat, 'auto'>,
  changed: boolean,
  diff: string
): CompareResult {
  const stats = diffStats(diff);
  return {
    status,
    actualPath: options.actualPath,
    goldenPath: options.goldenPath,
    format,
    changed,
    diff,
    summary: {
      status,
      actualPath: options.actualPath,
      goldenPath: options.goldenPath,
      format,
      changed,
      ...stats
    }
  };
}

async function readGolden(goldenPath: string): Promise<string | undefined> {
  try {
    return await readFile(goldenPath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

function resolveFormat(format: CompareFormat, actualPath: string): Exclude<CompareFormat, 'auto'> {
  if (format !== 'auto') {
    return format;
  }
  return path.extname(actualPath).toLowerCase() === '.json' ? 'json' : 'text';
}
