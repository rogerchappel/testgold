# TestGold

Framework-agnostic golden fixture manager for deterministic CLI and library tests.

TestGold compares actual command or library output against readable golden files. It normalizes noisy values first, prints a unified diff when output changes, and only updates goldens when --accept is supplied.

## Install

```sh
npm install --save-dev testgold
```

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

## Library API

Import compareGolden from testgold and call it with actualPath, goldenPath, and optional configPath. The result includes status, diff, and a JSON-friendly summary.

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
bash scripts/validate.sh
```

## Limitations

- Golden files are best for deterministic outputs; highly dynamic logs should be normalized with explicit scrubbers before comparison.
- `--accept` should be treated as a review action, not an automatic CI repair step.
- TestGold does not decide whether a changed fixture is correct; it makes the diff repeatable and reviewable.

## Attribution

Inspired by approval tests, Jest snapshots, and golden-file patterns in compiler/tooling projects. Reframed as a framework-agnostic CLI for local deterministic fixtures.
