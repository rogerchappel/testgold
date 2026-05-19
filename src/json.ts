import type { JsonMode } from './types.js';

export function normalizeJson(raw: string, mode: JsonMode): string {
  const parsed = JSON.parse(raw) as unknown;
  const normalized = mode === 'preserve' ? parsed : normalizeJsonValue(parsed, mode);
  return JSON.stringify(normalized, null, 2) + '\n';
}

function normalizeJsonValue(value: unknown, mode: JsonMode): unknown {
  if (Array.isArray(value)) {
    const items = value.map((item) => normalizeJsonValue(item, mode));
    if (mode === 'sort-arrays') {
      return [...items].sort((left, right) => stableStringify(left).localeCompare(stableStringify(right)));
    }
    return items;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, normalizeJsonValue(item, mode)] as const);
    return Object.fromEntries(entries);
  }

  return value;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}
