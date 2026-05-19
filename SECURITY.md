# Security Policy

TestGold is a local-first CLI. It does not require secrets, does not make network calls during normal use, and does not collect telemetry.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.x     | Yes       |

## Reporting a Vulnerability

Report suspected vulnerabilities privately to the maintainers. Do not open a public issue until maintainers have had time to investigate.

Include:

- affected version or commit
- reproduction steps
- expected and actual behavior
- impact assessment if known
- suggested fix if available

## Security-Relevant Areas

- path handling for --actual, --golden, and --config
- explicit write behavior behind --accept
- regular-expression scrubber behavior
- package and release automation

## Privacy

Fixture contents stay on the local machine unless a user commits or shares them. TestGold does not upload fixture data.
