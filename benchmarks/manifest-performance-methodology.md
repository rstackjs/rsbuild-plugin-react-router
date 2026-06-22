# Manifest-generation performance benchmark recipe

This document defines the reproducible commands and metric checklist for
measuring manifest-generation performance before and after the route-analysis /
manifest cache deduplication work.

## Environment notes

Use the same machine, branch, package manager, and Node version for both halves
of an A/B comparison.

Record environment details for each run:

- Branch and commit
- Node and pnpm versions
- Platform
- Rsbuild and Rspack versions
- React Router package versions
- Benchmark fixture size

Fixture export-shape cycle from `scripts/benchmark/fixture.mjs`:

```text
plain, ssr-data, split-client, split-client, ssr-data, client-server-imports
```

For 256 generated routes this yields:

| Profile                                                      | Count |
| ------------------------------------------------------------ | ----: |
| plain                                                        |    42 |
| ssr-data                                                     |    86 |
| split-client                                                 |    86 |
| client-server-imports                                        |    42 |
| splittable routes (`split-client` + `client-server-imports`) |   128 |

## Existing benchmark harness

The benchmark harness is `scripts/bench-builds.mjs`; package scripts are defined
in `package.json`:

```sh
pnpm bench:smoke     # 48-route smoke, 1 measured iteration
pnpm bench:baseline  # 256-route default profile, 5 measured iterations
pnpm bench:full      # 48/256/1024 route stress profile
```

The harness:

1. builds the plugin package (`pnpm build`) unless `--skip-root-build` is passed;
2. generates deterministic fixtures under `.benchmark/fixtures/`;
3. runs `node node_modules/@rsbuild/core/bin/rsbuild.js build --config rsbuild.config.mjs`;
4. keeps plugin instrumentation disabled for canonical end-to-end A/B runs;
   pass `--log-performance` for a separate diagnostic run that emits structured
   `[react-router:performance]` logs;
5. wraps builds in `/usr/bin/time -v` when available and records user/sys/RSS;
6. writes `.benchmark/results/<run>/baseline.json` and `baseline.md`.

`rsbuild build --help` in this repo exposes `--log-level`, `--environment`,
`--mode`, and `--config`, but no dedicated benchmark/stats/profiling CLI flag.
Use end-to-end wall time, process CPU, and RSS as the primary comparison
signals. Plugin `logPerformance` reports are diagnostic because their timers
include queueing and add observer overhead. If low-level Rspack stats are needed later, add them through fixture
`rsbuild.config.mjs`; do not depend on a non-existent CLI flag.

## Pre-flight commands

Run from the repo root:

```sh
git status --short
git rev-parse HEAD
node --version
pnpm --version
pnpm install
pnpm build
```

Keep benchmark output under `.benchmark/`; it is gitignored. Do not use broad
`git clean -fdX` because it may delete `node_modules/` and TraceDecay indexes.

## Primary benchmark commands

Use the default 256-route profile for the canonical before/after comparison. It
includes the split fixture that exercises route-chunk/manifest analysis and the
non-split controls.

Baseline/current behavior:

```sh
node scripts/bench-builds.mjs \
  --profile default \
  --iterations 5 \
  --warmup 1 \
  --clean build \
  --format both \
  --out .benchmark/results/manifest-baseline
```

Post-refactor behavior on the same branch/machine:

```sh
node scripts/bench-builds.mjs \
  --profile default \
  --iterations 5 \
  --warmup 1 \
  --clean build \
  --format both \
  --out .benchmark/results/manifest-after-cache-dedup
```

If the refactor is gated behind an environment flag, run both toggles on the
same commit instead:

```sh
ROUTE_MANIFEST_CACHE_DEDUP=0 node scripts/bench-builds.mjs \
  --profile default --iterations 5 --warmup 1 --clean build --format both \
  --out .benchmark/results/manifest-dedup-off

ROUTE_MANIFEST_CACHE_DEDUP=1 node scripts/bench-builds.mjs \
  --profile default --iterations 5 --warmup 1 --clean build --format both \
  --out .benchmark/results/manifest-dedup-on
```

For a quicker focused loop, isolate the split fixture:

```sh
node scripts/bench-builds.mjs \
  --profile default \
  --filter split \
  --iterations 3 \
  --warmup 1 \
  --clean build \
  --format both \
  --out .benchmark/results/manifest-split-smoke
```

For scaling validation after the refactor, use the full profile split fixtures:

```sh
node scripts/bench-builds.mjs \
  --profile full \
  --filter split \
  --iterations 5 \
  --warmup 1 \
  --clean build \
  --format both \
  --out .benchmark/results/manifest-scale
```

## Single-fixture command for manual debugging

The harness command for each fixture build is:

```sh
cd .benchmark/fixtures/synthetic-256-ssr-esm-split
REACT_ROUTER_BENCHMARK_LOG_PERFORMANCE=1 NODE_ENV=production \
  /usr/bin/time -v \
  node node_modules/@rsbuild/core/bin/rsbuild.js \
  build --config rsbuild.config.mjs --log-level info
```

Use this only for debugging logs. Use `scripts/bench-builds.mjs` for numbers
because it controls warmup, cleaning, aggregation, and output format.

## Metric checklist

### Canonical metrics in `baseline.json`

| Metric                      | Source                                                        | Why it matters                                                                                              |
| --------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Build wall time             | `benchmarks[].summary.wallMs`                                 | End-to-end user-visible build time.                                                                         |
| CPU time                    | `summary.userMs` + `summary.sysMs`                            | Less noisy than wall time when the machine has minor scheduling variance.                                   |
| Peak RSS                    | `summary.maxRssKb`                                            | Ensures cache dedup does not regress memory.                                                                |

### Diagnostic metrics with `--log-performance`

These fields are empty in canonical A/B runs because plugin instrumentation is
disabled by default. Use a separate diagnostic run when operation-level
attribution is needed.

| Metric                      | Source                                                        | Why it matters                                                                                              |
| --------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Compiler lifecycle          | each plugin report's `compilerLifecycleMs`                    | Plugin setup/build lifecycle timing per compiler environment.                                               |
| Transform invocation counts | `pluginOperations[].count`                                    | Counts route/manifest hook invocations. Counts should usually stay stable after dedup; timings should drop. |
| Transform cumulative time   | `pluginOperations[].totalMs`                                  | Primary signal for expensive plugin work moving out of duplicate paths.                                     |
| Slowest transform           | `pluginOperations[].maxMs` and `operations.*.slowest` in JSON | Catches per-route outliers hidden by totals.                                                                |

Relevant existing operation buckets:

- `manifest:transform`: virtual server/browser manifest module transform.
- `manifest:stage`: browser manifest staging callback in `modifyBrowserManifest`.
- `route:client-entry`: route client-entry transform; currently calls
  `transformToEsm`, `getExportNames`, and, for web split builds,
  `detectRouteChunksIfEnabled`.
- `route:split-exports`: route source rewrite for split-route modules; currently
  calls `transformToEsm`, `detectRouteChunksIfEnabled`, and `getExportNames`.
- `route:chunk`: per-`?route-chunk=` transform; currently calls
  `transformToEsm`, `getRouteChunkIfEnabled`, and, for enforce mode on `main`,
  `getExportNames`.
- `route:module`: `?react-router-route` transform.
- `module:client-only-stub` and `module:server-only-guard`: import guard/stub
  overhead, useful controls for unrelated plugin transform cost.

### Add or instrument for the cache-dedup refactor

The existing profiler is transform-bucket level. To prove manifest-generation
cache deduplication specifically, add direct counters around the lower-level
operations below, either as new `performanceProfiler.record*` operation names or
as a `counters` object in `ReactRouterPerformanceReport`.

| Counter / metric                              | Suggested operation name                                       |                              Expected baseline for 256-route default split build | Notes                                                                                                                    |
| --------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------ |
| Route-file stat calls                         | `manifest:route-stat`                                          |                                                                    257 per build | `getRouteModuleAnalysis(resourcePath)` calls `stat` before cache lookup. Root + 256 routes.                              |
| Route-file reads                              | `manifest:route-read`                                          |                                                    257 per build on a cold build | Count the `readFile(resourcePath, 'utf8')` inside `getRouteModuleAnalysis` cache misses.                                 |
| Route source transforms for manifest analysis | `manifest:route-transform-to-esm`                              |                                                    257 per build on a cold build | Same cache-miss path as route reads.                                                                                     |
| Export extractions for manifest analysis      | `manifest:route-export-extract`                                |                                                    257 per build on a cold build | `getRouteModuleAnalysis` calls `getExportNames(code)` once per route-module analysis miss.                               |
| Manifest route analysis wall time             | `manifest:route-analysis`                                      |                                               257 samples; report total/mean/p95 | Wrap one route's `getRouteModuleAnalysis` + split detection inside `getReactRouterManifestForDev`.                       |
| Total manifest route-map wall time            | `manifest:route-map`                                           |                                                        1 per manifest generation | Wrap the `Promise.all(Object.entries(routes).map(...))` block in `manifest.ts`.                                          |
| Split-route detection calls from manifest     | `manifest:route-chunk-detect`                                  |                                                              257 per split build | Only when `isBuild && routeChunkConfig`. Must drop duplicated work after dedup if manifest reuses cached route analysis. |
| Babel route-chunk parse calls                 | `route-chunk:parse`                                            |       currently at most 1 per `(route, code)` cache key, but direct count needed | Current code caches parse but still clones AST on each access; count parse separately from clone.                        |
| Babel route-chunk traverse calls              | `route-chunk:traverse`                                         |       currently at most 1 per `(route, code)` cache key, but direct count needed | Wrap `getExportDependencies`.                                                                                            |
| AST structured clones                         | `route-chunk:structured-clone`                                 | roughly 1 for dependency analysis + 1 per generated chunk for splittable modules | This is the expected direct win for RouteChunkAnalysis-style dedup.                                                      |
| Chunk code generations                        | `route-chunk:generate`                                         |                                               up to 5 per fully splittable route | Count `generate()` in `getChunkedExport` and `omitChunkedExports`.                                                       |
| Per-route analysis time                       | `manifest:route-analysis` / `route-chunk:analyze` slowest list |                                                     one resource entry per route | Keep `resource` as the route file path so `slowest` pinpoints outliers.                                                  |

Acceptance rule: the refactor should reduce direct manifest/read/export-analysis
work or route-chunk analysis work without changing the externally visible route
transform invocation counts for the same fixture. If `pluginOperations[].count`
changes, explain why the module graph changed; otherwise compare `totalMs`,
`maxMs`, and direct counters.

## Baseline expectations

For the split fixture after cache dedup:

- `route:client-entry`, `route:module`, `route:split-exports`, and
  `route:chunk` invocation counts should remain approximately the same because
  the module graph and virtual modules are unchanged.
- `route:client-entry.totalMs` and `route:chunk.totalMs` are the hot buckets to
  reduce. On head they dominate the split fixture: ~363.8s and ~409.9s summed
  across five measured builds.
- Direct `manifest:route-read`, `manifest:route-export-extract`, and
  `manifest:route-analysis` counters should show 257 route analyses per cold
  build before dedup. If a new shared cache lets transform hooks and manifest
  generation reuse one analysis result, the duplicated lower-level counters
  should fall while the transform-level counts stay stable.
- Direct `route-chunk:structured-clone` should fall materially if the refactor
  removes per-query AST cloning.

Use `synthetic-256-ssr-esm` as the non-split control. It should not materially
change when the split-route cache path changes.

## Comparison procedure

1. Run the baseline and post-refactor commands back-to-back on the same machine.
2. Compare `synthetic-256-ssr-esm-split` first:
   - wall median and p95;
   - CPU median (`userMs + sysMs`);
   - p95 RSS;
   - `route:client-entry.totalMs`;
   - `route:chunk.totalMs`;
   - direct manifest/route-analysis counters added for the refactor.
3. Check `synthetic-256-ssr-esm` and `synthetic-256-sourcemaps` as controls.
   Their route-chunk-specific direct counters should remain zero or unchanged.
4. Use `operations.*.slowest` in `baseline.json` to inspect outlier route files
   if medians improve but max transform time regresses.
5. For a final report, include both absolute values and percentage deltas.

Suggested report table:

```text
| Metric (256 split fixture) | Before | After | Delta |
|---|---:|---:|---:|
| Wall median | 2.07s | ... | ... |
| CPU median (user+sys) | ... | ... | ... |
| Peak RSS p95 | 704 MB | ... | ... |
| route:client-entry totalMs | 363767.2ms | ... | ... |
| route:chunk totalMs | 409899.2ms | ... | ... |
| manifest route reads / build | 257 expected | ... | ... |
| manifest export extractions / build | 257 expected | ... | ... |
| route-chunk structuredClone calls / build | instrument | ... | ... |
| per-route analysis p95 | instrument | ... | ... |
```
