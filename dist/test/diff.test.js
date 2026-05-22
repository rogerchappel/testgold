import test from 'node:test';
import assert from 'node:assert/strict';
import { diffStats, unifiedDiff } from '../src/diff.js';
test('renders a compact unified diff', () => {
    const diff = unifiedDiff('one\ntwo\n', 'one\nthree\n', 'expected', 'actual');
    assert.match(diff, /^--- expected\n\+\+\+ actual\n one\n-two\n\+three\n$/);
});
test('counts added and removed lines', () => {
    const stats = diffStats('--- expected\n+++ actual\n one\n-two\n+three\n');
    assert.deepEqual(stats, { addedLines: 1, removedLines: 1 });
});
//# sourceMappingURL=diff.test.js.map