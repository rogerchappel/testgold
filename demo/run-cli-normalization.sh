#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/.tmp/cli-normalization-demo"

cd "$ROOT"
rm -rf "$OUT"
mkdir -p "$OUT"

npm run build >/dev/null

node dist/src/cli.js compare \
  --actual examples/cli-output.actual.txt \
  --golden examples/cli-output.golden.txt \
  --config examples/testgold.config.json \
  --summary-json | tee "$OUT/matching-summary.json"

cp examples/cli-output.actual.txt "$OUT/changed-output.txt"
printf '\nextra line for review\n' >>"$OUT/changed-output.txt"

if node dist/src/cli.js compare \
  --actual "$OUT/changed-output.txt" \
  --golden examples/cli-output.golden.txt \
  --config examples/testgold.config.json >"$OUT/diff.txt"; then
  echo "Expected changed fixture to produce a diff" >&2
  exit 1
fi

grep -q '"status": "passed"' "$OUT/matching-summary.json"
grep -q "extra line for review" "$OUT/diff.txt"

printf 'Demo wrote:\n'
printf '  %s\n' "$OUT/matching-summary.json"
printf '  %s\n' "$OUT/diff.txt"
