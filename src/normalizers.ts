import os from 'node:os';
import type { ScrubberConfig, TestGoldConfig } from './types.js';

type BuiltInRule = {
  pattern: RegExp;
  replacement: string;
};

const builtIns: Record<string, BuiltInRule> = {
  'iso-date': {
    pattern: /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z\b/g,
    replacement: '<ISO_DATE>'
  },
  'epoch-ms': {
    pattern: /\b1[6-9]\d{11}\b/g,
    replacement: '<EPOCH_MS>'
  },
  'tmp-path': {
    pattern: /(?:\/var\/folders|\/tmp|\/private\/tmp|C:\\Users\\[^\s]+\\AppData\\Local\\Temp)[^\s"']*/g,
    replacement: '<TMP_PATH>'
  },
  'home-path': {
    pattern: new RegExp(escapeRegExp(os.homedir()), 'g'),
    replacement: '<HOME>'
  },
  cwd: {
    pattern: new RegExp(escapeRegExp(process.cwd()), 'g'),
    replacement: '<CWD>'
  },
  'windows-path': {
    pattern: /[A-Z]:\\(?:[^\\\r\n]+\\)*[^\\\r\n]*/g,
    replacement: '<WINDOWS_PATH>'
  },
  uuid: {
    pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
    replacement: '<UUID>'
  }
};

export function normalizeText(raw: string, config: Required<TestGoldConfig>): string {
  const withNewlines = config.newline === 'lf' ? raw.replace(/\r\n/g, '\n') : raw;
  const scrubbed = config.scrubbers.reduce((current, scrubber) => applyScrubber(current, scrubber), withNewlines);
  return scrubbed.endsWith('\n') ? scrubbed : scrubbed + '\n';
}

function applyScrubber(value: string, scrubber: ScrubberConfig): string {
  if (typeof scrubber === 'string') {
    const builtIn = builtIns[scrubber];
    return builtIn ? value.replace(builtIn.pattern, builtIn.replacement) : value;
  }

  const flags = scrubber.flags ?? 'g';
  return value.replace(new RegExp(scrubber.pattern, flags), scrubber.replacement);
}

function escapeRegExp(value: string): string {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}
