# Review CLI Output With TestGold

Use this recipe when a CLI emits timestamps, process IDs, or temporary paths that make direct string comparisons noisy.

## Fixture Files

- `examples/cli-output.actual.txt` contains realistic command output.
- `examples/cli-output.golden.txt` is the reviewed golden file.
- `examples/testgold.config.json` normalizes ISO dates, temp paths, and `pid=<number>` values.

## Run The Demo

```sh
bash demo/run-cli-normalization.sh
```

The script writes:

- `.tmp/cli-normalization-demo/matching-summary.json`
- `.tmp/cli-normalization-demo/diff.txt`

The first comparison passes after normalization. The second appends an extra line and captures the diff reviewers would inspect before accepting a new golden.

## Review Notes

- Use `--summary-json` when another tool needs the pass/fail result.
- Use `--accept` only after the changed output has been reviewed.
- Keep scrubbers narrow enough that they remove unstable noise without hiding meaningful output changes.
