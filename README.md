# TestGold

Framework-agnostic golden fixture manager for deterministic CLI and library tests.

TestGold compares actual command or library output against readable golden files. It normalizes noisy values first, prints a unified diff when output changes, and only updates goldens when --accept is supplied.

## Install

```sh
npm install --save-dev github:rogerchappel/testgold
```

The GitHub source is the supported install path until the first npm release is
published. After that release, `npm install --save-dev testgold` will also be
supported.

For local development:

```sh
npm install
npm run build
```

## CLI

Compare fixtures:

```sh
npx testgold compare --actual fixtures/text/actual.txt --golden fixtures/text/expected.txt --config fixtures/testgold.config.json
```

Write an intentional update:

```sh
npx testgold compare --actual fixtures/text/actual.txt --golden fixtures/text/expected.txt --config fixtures/testgold.config.json --accept
```

Print a machine-readable summary:

```sh
npx testgold compare --actual fixtures/json/actual.json --golden fixtures/json/expected.json --config fixtures/testgold.config.json --summary-json
```

With `--summary-json`, stdout contains exactly one JSON value for both passing and failing comparisons, so callers can parse the complete stream. A mismatch still exits with status 1 and writes its unified diff to stderr. Without `--summary-json`, the human-readable summary and any unified diff are written to stdout; stderr remains available for errors.

Run the CLI output normalization walkthrough:

```sh
bash demo/run-cli-normalization.sh
```

See [docs/tutorials/review-cli-output.md](docs/tutorials/review-cli-output.md) for the fixture review flow and generated diff artifact.

## Config

testgold.config.json is optional. Without it, TestGold applies conservative built-in scrubbers and sorts JSON object keys.

Built-in scrubbers:

- iso-date
- epoch-ms
- tmp-path
- home-path
- cwd
- windows-path
- uuid

JSON modes:

- preserve: format parsed JSON without reordering.
- sort-keys: sort object keys recursively.
- sort-arrays: sort object keys and arrays by stable JSON representation.

Newline modes:

- lf: convert CRLF line endings to LF (the default).
- preserve: leave existing line endings unchanged.

Custom scrubbers are objects with required string `pattern` and `replacement` fields. The optional `name` is descriptive, and optional `flags` uses JavaScript regular-expression flags (`g` is the default):

```json
{
  "scrubbers": [
    "iso-date",
    {
      "name": "run-id",
      "pattern": "run-[0-9]+",
      "replacement": "run-<ID>",
      "flags": "gi"
    }
  ],
  "jsonMode": "sort-keys",
  "newline": "lf"
}
```

Configuration is validated when loaded. A malformed root, invalid field type, unknown built-in scrubber, unsupported mode, or invalid custom regular expression stops the comparison and exits the CLI with a `Configuration error in <path>:` message. This prevents misspelled scrubber names from being treated as ordinary fixture differences.

## Library API

Import compareGolden from testgold and call it with actualPath, goldenPath, and optional configPath. The result includes status, diff, and a JSON-friendly summary.

```ts
import { compareGolden } from 'testgold';

const result = await compareGolden({
  actualPath: 'fixtures/text/actual.txt',
  goldenPath: 'fixtures/text/expected.txt',
  configPath: 'fixtures/testgold.config.json'
});

console.log(result.status);
```

## Fixtures

This repository includes fixtures for:

- text output with custom scrubbers
- timestamps and UUIDs
- POSIX, home, temp, and Windows-style paths
- unordered JSON arrays and object keys

## Development

```sh
npm run check
npm test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
bash demo/run-cli-normalization.sh
bash scripts/validate.sh
```

## Limitations

- Golden files are best for deterministic outputs; highly dynamic logs should be normalized with explicit scrubbers before comparison.
- `--accept` should be treated as a review action, not an automatic CI repair step.
- TestGold does not decide whether a changed fixture is correct; it makes the diff repeatable and reviewable.

## Attribution

Inspired by approval tests, Jest snapshots, and golden-file patterns in compiler/tooling projects. Reframed as a framework-agnostic CLI for local deterministic fixtures.
