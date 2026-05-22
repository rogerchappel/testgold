export function normalizeJson(raw, mode) {
    const parsed = JSON.parse(raw);
    const normalized = mode === 'preserve' ? parsed : normalizeJsonValue(parsed, mode);
    return JSON.stringify(normalized, null, 2) + '\n';
}
function normalizeJsonValue(value, mode) {
    if (Array.isArray(value)) {
        const items = value.map((item) => normalizeJsonValue(item, mode));
        if (mode === 'sort-arrays') {
            return [...items].sort((left, right) => stableStringify(left).localeCompare(stableStringify(right)));
        }
        return items;
    }
    if (value && typeof value === 'object') {
        const entries = Object.entries(value)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, item]) => [key, normalizeJsonValue(item, mode)]);
        return Object.fromEntries(entries);
    }
    return value;
}
function stableStringify(value) {
    return JSON.stringify(value);
}
//# sourceMappingURL=json.js.map