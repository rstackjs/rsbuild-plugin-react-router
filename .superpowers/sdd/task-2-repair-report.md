# Task 2 repair report

Result: Empty benchmark sample arrays are rejected for both base and head payloads.

Changed:
- `scripts/benchmark/compare-model.mts`: require at least one `samplesMs` value per case.
- `tests/benchmark-compare.test.ts`: cover the empty-samples regression.

Tests:
- `pnpm exec rstest run -c ./rstest.config.ts tests/benchmark-compare.test.ts --pool.maxWorkers=1` — red: empty samples did not throw.
- `pnpm exec rstest run -c ./rstest.config.ts tests/benchmark-compare.test.ts --pool.maxWorkers=1` — green: 8 passed.
