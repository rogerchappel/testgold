import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSummary } from '../src/summary.js';
test('renders human-readable summary fields', () => {
    const rendered = renderSummary({
        status: 'passed',
        actualPath: 'actual.txt',
        goldenPath: 'expected.txt',
        format: 'text',
        changed: false,
        addedLines: 0,
        removedLines: 0
    });
    assert.match(rendered, /status: passed/);
    assert.match(rendered, /changed: false/);
});
//# sourceMappingURL=summary.test.js.map