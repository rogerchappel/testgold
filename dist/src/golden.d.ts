import type { CompareFormat, CompareOptions, CompareResult, NormalizedFixture, TestGoldConfig } from './types.js';
export declare function compareGolden(options: CompareOptions): Promise<CompareResult>;
export declare function normalizeFixture(raw: string, format: Exclude<CompareFormat, 'auto'>, config: Required<TestGoldConfig>): NormalizedFixture;
//# sourceMappingURL=golden.d.ts.map