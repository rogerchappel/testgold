export type DiffStats = {
  addedLines: number;
  removedLines: number;
};

export function unifiedDiff(expected: string, actual: string, expectedLabel = 'golden', actualLabel = 'actual'): string {
  if (expected === actual) {
    return '';
  }

  const expectedLines = splitLines(expected);
  const actualLines = splitLines(actual);
  const table = lcsTable(expectedLines, actualLines);
  const body = buildDiffBody(expectedLines, actualLines, table);

  return ['--- ' + expectedLabel, '+++ ' + actualLabel, ...body].join('\n') + '\n';
}

export function diffStats(diff: string): DiffStats {
  const lines = diff.split('\n').slice(2);
  return {
    addedLines: lines.filter((line) => line.startsWith('+') && !line.startsWith('+++')).length,
    removedLines: lines.filter((line) => line.startsWith('-') && !line.startsWith('---')).length
  };
}

function splitLines(value: string): string[] {
  const withoutTerminal = value.endsWith('\n') ? value.slice(0, -1) : value;
  return withoutTerminal.length === 0 ? [] : withoutTerminal.split('\n');
}

function lcsTable(left: string[], right: string[]): number[][] {
  const table = Array.from({ length: left.length + 1 }, () => Array<number>(right.length + 1).fill(0));

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      table[i]![j] = left[i] === right[j] ? table[i + 1]![j + 1]! + 1 : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
    }
  }

  return table;
}

function buildDiffBody(left: string[], right: string[], table: number[][]): string[] {
  const body: string[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      body.push(' ' + left[i]);
      i += 1;
      j += 1;
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      body.push('-' + left[i]);
      i += 1;
    } else {
      body.push('+' + right[j]);
      j += 1;
    }
  }

  while (i < left.length) {
    body.push('-' + left[i]);
    i += 1;
  }

  while (j < right.length) {
    body.push('+' + right[j]);
    j += 1;
  }

  return body;
}
