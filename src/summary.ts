import type { CompareSummary } from './types.js';

export function renderSummary(summary: CompareSummary): string {
  return [
    'status: ' + summary.status,
    'actual: ' + summary.actualPath,
    'golden: ' + summary.goldenPath,
    'format: ' + summary.format,
    'changed: ' + String(summary.changed),
    'added_lines: ' + summary.addedLines,
    'removed_lines: ' + summary.removedLines
  ].join('\n');
}
