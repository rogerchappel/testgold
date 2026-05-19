# TestGold

Framework-agnostic golden fixture manager for deterministic CLI and library tests.

TestGold compares actual command or library output against readable golden files. It normalizes noisy values first, prints a unified diff when output changes, and only updates goldens when --accept is supplied.

## Install

npm install --save-dev testgold

For local development:

npm install
npm run build

## CLI

Compare fixtures:

npx testgold compare --actual fixtures/text/actual.txt --golden fixtures/text/expected.txt --config fixtures/testgold.config.json

Write an intentional update:

npx testgold compare --actual fixtures/text/actual.txt --golden fixtures/text/expected.txt --config fixtures/testgold.config.json --accept

Print a machine-readable summary:

npx testgold compare --actual fixtures/json/actual.json --golden fixtures/json/expected.json --config fixtures/testgold.config.json --summary-json

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

npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh

## Attribution

Inspired by approval tests, Jest snapshots, and golden-file patterns in compiler/tooling projects. Reframed as a framework-agnostic CLI for local deterministic fixtures.
