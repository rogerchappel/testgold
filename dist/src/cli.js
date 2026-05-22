#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { compareGolden } from './golden.js';
import { renderSummary } from './summary.js';
const version = '0.1.0';
export async function main(argv = process.argv.slice(2)) {
    const command = argv[0];
    if (!command || command === 'help' || command === '--help' || command === '-h') {
        printHelp();
        return 0;
    }
    if (command === '--version' || command === '-v') {
        console.log(version);
        return 0;
    }
    if (command !== 'compare') {
        console.error('Unknown command: ' + command);
        printHelp();
        return 2;
    }
    const options = parseCompareOptions(argv.slice(1));
    if (options.help) {
        printHelp();
        return 0;
    }
    if (!options.actual || !options.golden) {
        console.error('Missing required --actual and --golden paths.');
        return 2;
    }
    const compareOptions = {
        actualPath: options.actual,
        goldenPath: options.golden,
        accept: options.accept,
        format: options.format
    };
    const result = await compareGolden(options.config ? { ...compareOptions, configPath: options.config } : compareOptions);
    if (options.summaryJson) {
        console.log(JSON.stringify(result.summary, null, 2));
    }
    else {
        console.log(renderSummary(result.summary));
    }
    if (result.diff) {
        console.log('');
        process.stdout.write(result.diff);
    }
    return result.status === 'failed' ? 1 : 0;
}
function parseCompareOptions(argv) {
    const parsed = parseArgs({
        args: argv,
        allowPositionals: false,
        options: {
            actual: { type: 'string' },
            golden: { type: 'string' },
            config: { type: 'string' },
            accept: { type: 'boolean', default: false },
            format: { type: 'string', default: 'auto' },
            'summary-json': { type: 'boolean', default: false },
            help: { type: 'boolean', short: 'h', default: false }
        }
    });
    const format = parsed.values.format;
    if (format !== 'auto' && format !== 'text' && format !== 'json') {
        throw new Error('--format must be one of auto, text, or json.');
    }
    return {
        actual: parsed.values.actual,
        golden: parsed.values.golden,
        config: parsed.values.config,
        accept: parsed.values.accept,
        format,
        summaryJson: parsed.values['summary-json'],
        help: parsed.values.help
    };
}
function printHelp() {
    console.log('testgold ' + version + '\\n\\n' +
        'Usage:\\n' +
        '  testgold compare --actual <path> --golden <path> [options]\\n\\n' +
        'Options:\\n' +
        '  --accept            Write the normalized actual output to the golden file.\\n' +
        '  --config <path>     JSON config with scrubbers and JSON normalization mode.\\n' +
        '  --format <mode>     auto, text, or json. Defaults to auto.\\n' +
        '  --summary-json      Print a machine-readable JSON summary.\\n' +
        '  -h, --help          Show this help.\\n' +
        '  -v, --version       Show version.\\n');
}
main().then((code) => {
    process.exitCode = code;
}).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map