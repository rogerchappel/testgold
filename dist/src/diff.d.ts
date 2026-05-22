export type DiffStats = {
    addedLines: number;
    removedLines: number;
};
export declare function unifiedDiff(expected: string, actual: string, expectedLabel?: string, actualLabel?: string): string;
export declare function diffStats(diff: string): DiffStats;
//# sourceMappingURL=diff.d.ts.map