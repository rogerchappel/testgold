import { readFile } from 'node:fs/promises';
import path from 'node:path';
const builtInScrubbers = [
    'iso-date', 'epoch-ms', 'tmp-path', 'home-path', 'cwd', 'windows-path', 'uuid'
];
const jsonModes = ['preserve', 'sort-keys', 'sort-arrays'];
const newlineModes = ['lf', 'preserve'];
const defaultConfig = {
    scrubbers: ['iso-date', 'epoch-ms', 'tmp-path', 'home-path', 'cwd', 'windows-path', 'uuid'],
    jsonMode: 'sort-keys',
    newline: 'lf'
};
export async function loadConfig(configPath) {
    if (!configPath) {
        return { ...defaultConfig, scrubbers: [...defaultConfig.scrubbers] };
    }
    const resolved = path.resolve(configPath);
    let parsed;
    try {
        const raw = await readFile(resolved, 'utf8');
        parsed = JSON.parse(raw);
        validateConfig(parsed);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Configuration error in ${resolved}: ${message}`);
    }
    const config = parsed;
    return {
        scrubbers: config.scrubbers ?? [...defaultConfig.scrubbers],
        jsonMode: config.jsonMode ?? defaultConfig.jsonMode,
        newline: config.newline ?? defaultConfig.newline
    };
}
function validateConfig(value) {
    if (!isObject(value)) {
        throw new Error('configuration must be a JSON object.');
    }
    if (value.scrubbers !== undefined) {
        if (!Array.isArray(value.scrubbers)) {
            throw new Error('"scrubbers" must be an array.');
        }
        value.scrubbers.forEach(validateScrubber);
    }
    if (value.jsonMode !== undefined && !jsonModes.includes(value.jsonMode)) {
        throw new Error('"jsonMode" must be one of preserve, sort-keys, or sort-arrays.');
    }
    if (value.newline !== undefined && !newlineModes.includes(value.newline)) {
        throw new Error('"newline" must be one of lf or preserve.');
    }
}
function validateScrubber(value, index) {
    if (typeof value === 'string') {
        if (!builtInScrubbers.includes(value)) {
            throw new Error(`unknown built-in scrubber "${value}" at scrubbers[${index}].`);
        }
        return;
    }
    if (!isObject(value)) {
        throw new Error(`scrubbers[${index}] must be a built-in name or custom scrubber object.`);
    }
    if (typeof value.pattern !== 'string') {
        throw new Error(`scrubbers[${index}].pattern must be a string.`);
    }
    if (typeof value.replacement !== 'string') {
        throw new Error(`scrubbers[${index}].replacement must be a string.`);
    }
    if (value.name !== undefined && typeof value.name !== 'string') {
        throw new Error(`scrubbers[${index}].name must be a string.`);
    }
    if (value.flags !== undefined && typeof value.flags !== 'string') {
        throw new Error(`scrubbers[${index}].flags must be a string.`);
    }
    try {
        new RegExp(value.pattern, value.flags ?? 'g');
    }
    catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        throw new Error(`scrubbers[${index}] has an invalid regular expression: ${detail}`);
    }
}
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=config.js.map