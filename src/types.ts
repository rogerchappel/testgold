export type BuiltInScrubber =
  | 'iso-date'
  | 'epoch-ms'
  | 'tmp-path'
  | 'home-path'
  | 'cwd'
  | 'windows-path'
  | 'uuid';

export type ScrubberConfig =
  | BuiltInScrubber
  | {
      name?: string;
      pattern: string;
      replacement: string;
      flags?: string;
    };

export type JsonMode = 'preserve' | 'sort-keys' | 'sort-arrays';

export type TestGoldConfig = {
  scrubbers?: ScrubberConfig[];
  jsonMode?: JsonMode;
  newline?: 'lf' | 'preserve';
};

export type CompareFormat = 'text' | 'json' | 'auto';

export type CompareOptions = {
  actualPath: string;
  goldenPath: string;
  configPath?: string;
  accept?: boolean;
  format?: CompareFormat;
};

export type NormalizedFixture = {
  raw: string;
  normalized: string;
  format: Exclude<CompareFormat, 'auto'>;
};

export type CompareStatus = 'passed' | 'failed' | 'accepted' | 'created';

export type CompareResult = {
  status: CompareStatus;
  actualPath: string;
  goldenPath: string;
  format: Exclude<CompareFormat, 'auto'>;
  changed: boolean;
  diff: string;
  summary: CompareSummary;
};

export type CompareSummary = {
  status: CompareStatus;
  actualPath: string;
  goldenPath: string;
  format: Exclude<CompareFormat, 'auto'>;
  changed: boolean;
  addedLines: number;
  removedLines: number;
};
