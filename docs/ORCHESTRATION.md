# TestGold Orchestration

## Project

- Name: testgold
- GitHub: rogerchappel/testgold
- Default branch: main
- Package manager: npm
- Runtime: Node.js 20+
- Scope: framework-agnostic golden fixture manager

## Local Commands

- npm install
- npm run check
- npm test
- npm run build
- npm run smoke
- bash scripts/validate.sh

## Smoke Fixture

node dist/cli.js compare --actual fixtures/text/actual.txt --golden fixtures/text/expected.txt --config fixtures/testgold.config.json --summary-json

Expected status: passed.

## Release Notes

Release automation is scaffolded but publishing is disabled until explicitly configured. The package is local-first and does not collect telemetry.

## Agent Boundaries

- Work inside this repository only.
- Do not add telemetry, network calls, or secret handling.
- Keep golden updates explicit through --accept.
- Keep fixtures readable and normalized.
