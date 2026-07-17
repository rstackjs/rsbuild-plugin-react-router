# CodSpeed Benchmark Rewrite Design

## Goal

Replace the current bespoke benchmark system with a small, case-oriented Vitest suite that produces useful local and pull-request comparisons without depending on CodSpeed, while publishing the same benchmarks to CodSpeed when repository access becomes available.

## Architecture

The benchmark harness lives under `benchmarks/` and owns deterministic fixtures, benchmark case definitions, and result formatting. Cases invoke the plugin through a caller-supplied plugin checkout so the harness from the pull-request head can measure both the base and head implementations consistently. The initial suite keeps a representative production build case and a development startup/update case rather than the current profile, shard, and synthetic-app matrix.

Vitest is the benchmark runner. `@codspeed/vitest-plugin` instruments the same benchmark definitions when they run inside CodSpeed and falls back to normal Vitest behavior locally. Local runs emit machine-readable JSON. A compact comparison script validates matching base/head cases, calculates deltas, writes Markdown, and upserts one pull-request comment.

## CI Data Flow

For pull requests, CI checks out the pull-request head and base, installs both, then uses the head benchmark harness to run each plugin checkout. Local benchmark execution and comparison are required steps. If a case fails, results are missing, or base/head case names differ, the job fails. The generated Markdown is written to the GitHub job summary and posted as an idempotent pull-request comment.

A separate CodSpeed step runs the head suite through `CodSpeedHQ/action@v4`. It runs for pull requests, pushes to `main`, and manual dispatches so CodSpeed can establish a default-branch baseline once repository access is approved. This step has `continue-on-error: true`; missing CodSpeed access or upload failures do not fail CI. The normal local benchmark step remains authoritative and blocking.

## Components

- `benchmarks/cases/`: focused case definitions and deterministic fixture inputs.
- `benchmarks/helpers/`: fixture lifecycle and plugin-checkout resolution shared by cases.
- `benchmarks/*.bench.ts`: Vitest benchmark registrations.
- `vitest.benchmark.config.ts`: benchmark-only Vitest configuration with the CodSpeed plugin and JSON output settings.
- `scripts/benchmark/compare.mts`: validates and compares base/head JSON, then renders Markdown.
- `scripts/benchmark/comment.mts`: creates or updates the single benchmark pull-request comment.
- `.github/workflows/benchmark.yml`: required local base/head comparison plus optional CodSpeed publication.

## Removed System

Remove the current profile runner, custom statistics/report model, sharded workflow, history-branch persistence, diagnostics bundle, and embedded synthetic benchmark workspace. Remove their package scripts and tests. Preserve only fixture-generation logic that is still necessary for the new focused cases, moving it behind the new harness boundary.

## Error Handling

- Fixture creation, plugin builds, benchmark execution, JSON parsing, case matching, and pull-request commenting fail loudly.
- The comparison script rejects non-finite timings and duplicate or missing case identifiers.
- Cleanup runs in `finally` blocks and only removes benchmark-owned temporary directories.
- CodSpeed publication alone soft-fails and exposes its failed step in the workflow UI.

## Testing

- Unit tests cover comparison validation, delta calculation, Markdown rendering, and comment identification.
- Fixture tests cover deterministic generation and cleanup boundaries.
- A benchmark smoke command runs every registered case with minimal iterations.
- Workflow validation confirms pull-request, `main`, and manual triggers; required local comparison; and non-blocking CodSpeed publication.
- Final verification runs core tests, benchmark-specific tests, the smoke suite, type checking/build checks already used by the repository, and a clean-worktree check.

## Constraints

- Local and pull-request benchmark reporting must work before CodSpeed repository access is approved.
- Once an `rstackjs` organization owner enables the repository, no code change should be required for CodSpeed publication to start.
- CodSpeed failures must not hide benchmark failures.
- Benchmark output remains under ignored `.benchmark/` paths.
- No benchmark history branch or new runtime dependency is introduced.
