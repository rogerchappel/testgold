# TestGold PRD

Status: in-progress

## Summary

TestGold is a tiny golden-fixture manager for CLI and library tests. It helps projects keep expected outputs readable, normalized, and intentionally updated without introducing a heavyweight test framework.

## Problem

Golden fixtures are useful but become messy: timestamps leak in, paths differ by machine, and updates are unclear. Local-first OSS tools need deterministic snapshots with obvious review trails.

## Users

- Maintainers of CLI tools with fixture-heavy tests.
- Agents writing tests that need stable expected output.
- Developers reviewing generated snapshot updates.

## MVP

- Normalize stdout/stderr or JSON files using configurable scrubbers.
- Compare actual output to golden files.
- Update goldens only with an explicit `--accept` flag.
- Produce unified diffs and JSON summaries.
- Include fixtures for path, timestamp, unordered JSON, and text output cases.

## Non-goals

- Replacing Jest/Vitest snapshot APIs.
- Binary snapshot storage.
- Cloud approval workflows.

## Source Attribution

Inspired by approval tests, Jest snapshots, and golden-file patterns in compiler/tooling projects. Reframed as a framework-agnostic CLI for local deterministic fixtures.

