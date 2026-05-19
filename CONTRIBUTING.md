# Contributing

Thanks for helping improve TestGold.

## Local Setup

npm install
npm run build

## Development Checks

Run the relevant targeted check while developing, then run the full validation gate before opening a pull request:

- npm run check
- npm test
- npm run smoke
- bash scripts/validate.sh

## Golden Fixture Rules

- Keep fixtures readable.
- Normalize noisy values instead of committing machine-specific output.
- Use --accept only when the expected output intentionally changed.
- Include the resulting diff or summary in the pull request when goldens change.

## Pull Requests

PRs should include:

- summary of the change
- verification performed
- risk level
- rollback plan
- any follow-up work

## Commit Style

Use Conventional Commits:

- feat: add useful behavior
- fix: handle edge case
- docs: update usage
- test: cover parser behavior
- chore: refresh tooling

## Security

Do not report security issues in public issues. See SECURITY.md.
