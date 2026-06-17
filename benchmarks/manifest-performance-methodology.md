# Manifest-generation performance benchmark recipe

Task: `t_6008a898`
Repo: `/home/zack/projects/rsbuild-plugin-react-router`
Head measured: `c2452de1393264c2b01ef8aa03908077bce025db`

This document defines the reproducible commands and metric checklist for
measuring manifest-generation performance before and after the route-analysis /
manifest cache deduplication work.

## Environment notes

Use the same machine, branch, package manager, and Node version for both halves
of an A/B comparison.

Measured head environment:

- Branch: `perf/bundling-performance`
- Commit: `c2452de1393264c2b01ef8aa03908077bce025db`
- Node: `v22.22.3`
- pnpm: `9.15.3`
- Platform: `linux 6.8.0-124-generic x64`
- Rsbuild: `@rsbuild/core@2.0.15`
- Rspack: `@rspack/core@2.0.8`
- React Router packages: `7.13.0`
- Benchmark fixture size used for the baseline below: 256 routes plus the root
  route, so route-level transforms report 257 calls per compiler environment.

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
4. sets `REACT_ROUTER_BENCHMARK_LOG_PERFORMANCE=1`, enabling structured
   `[react-router:performance]` plugin logs;
5. wraps builds in `/usr/bin/time -v` when available and records user/sys/RSS;
6. writes `.benchmark/results/<run>/baseline.json` and `baseline.md`.

`rsbuild build --help` in this repo exposes `--log-level`, `--environment`,
`--mode`, and `--config`, but no dedicated benchmark/stats/profiling CLI flag.
Use the plugin `logPerformance` reports as the primary plugin-level source of
truth. If low-level Rspack stats are needed later, add them through fixture
`rsbuild.config.mjs`; do not depend on a non-existent CLI flag.

## Pre-flight commands

Run from the repo root:

```sh
cd /home/zack/projects/rsbuild-plugin-react-router

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
  node /home/zack/projects/rsbuild-plugin-react-router/node_modules/@rsbuild/core/bin/rsbuild.js \
  build --config rsbuild.config.mjs --log-level info
```

Use this only for debugging logs. Use `scripts/bench-builds.mjs` for numbers
because it controls warmup, cleaning, aggregation, and output format.

## Metric checklist

### Already observable from `baseline.json`

| Metric                      | Source                                                        | Why it matters                                                                                              |
| --------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Build wall time             | `benchmarks[].summary.wallMs`                                 | End-to-end user-visible build time.                                                                         |
| CPU time                    | `summary.userMs` + `summary.sysMs`                            | Less noisy than wall time when the machine has minor scheduling variance.                                   |
| Peak RSS                    | `summary.maxRssKb`                                            | Ensures cache dedup does not regress memory.                                                                |
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

## Head baseline recorded on `c2452de`

Command used:

```sh
node scripts/bench-builds.mjs \
  --profile default \
  --iterations 5 \
  --warmup 1 \
  --clean build \
  --format both \
  --out .benchmark/results/manifest-head-baseline
```

Output files:

- `.benchmark/results/manifest-head-baseline/baseline.json`
- `.benchmark/results/manifest-head-baseline/baseline.md`

Top-level summary:

| Benchmark                   | Routes | Variant       | Median wall | Mean wall | p95 wall | p95 RSS |
| --------------------------- | -----: | ------------- | ----------: | --------: | -------: | ------: |
| synthetic-256-ssr-esm       |    256 | ssr-esm       |       1.56s |     1.58s |    1.67s |  485 MB |
| synthetic-256-ssr-esm-split |    256 | ssr-esm-split |       2.07s |     2.10s |    2.16s |  704 MB |
| synthetic-256-spa           |    256 | spa           |       6.53s |     6.56s |    6.62s |  476 MB |
| synthetic-256-sourcemaps    |    256 | ssr-esm       |       1.62s |     1.63s |    1.69s |  529 MB |

Compiler lifecycle medians from the plugin reports:

| Benchmark                   | web median | node median |
| --------------------------- | ---------: | ----------: |
| synthetic-256-ssr-esm       |   1124.6ms |    1308.3ms |
| synthetic-256-ssr-esm-split |   1591.5ms |    1770.3ms |
| synthetic-256-spa           |   1082.0ms |    1246.4ms |
| synthetic-256-sourcemaps    |   1154.4ms |    1348.0ms |

### Operation counts: `synthetic-256-ssr-esm-split`

This is the primary manifest/cache-dedup comparison fixture because it enables
`future.v8_splitRouteModules`.

| Environment | Operation                  | Total count (5 runs) | Per build | Total time | Max single |
| ----------- | -------------------------- | -------------------: | --------: | ---------: | ---------: |
| web         | `route:chunk`              |                 1930 |     386.0 | 409899.2ms |    445.2ms |
| web         | `route:client-entry`       |                 1285 |     257.0 | 363767.2ms |    445.9ms |
| web         | `route:module`             |                 1285 |     257.0 |   1059.3ms |      7.8ms |
| node        | `route:module`             |                 1285 |     257.0 |    453.6ms |      7.3ms |
| node        | `manifest:transform`       |                    5 |       1.0 |     32.5ms |      7.3ms |
| node        | `module:client-only-stub`  |                    5 |       1.0 |     21.4ms |      6.9ms |
| web         | `route:split-exports`      |                 4595 |     919.0 |      0.8ms |      0.1ms |
| web         | `module:client-only-stub`  |                   15 |       3.0 |      0.5ms |      0.1ms |
| node        | `module:server-only-guard` |                   10 |       2.0 |      0.0ms |      0.0ms |
| node        | `route:split-exports`      |                 1390 |     278.0 |      0.0ms |      0.0ms |
| web         | `manifest:stage`           |                    5 |       1.0 |      0.0ms |      0.0ms |
| web         | `manifest:transform`       |                    5 |       1.0 |      0.0ms |      0.0ms |

Baseline expectations for the same fixture after cache dedup:

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

### Control operation counts: `synthetic-256-ssr-esm`

Use this as the non-split control. It should not materially change when the
split-route cache path changes.

| Environment | Operation                 | Total count (5 runs) | Per build | Total time | Max single |
| ----------- | ------------------------- | -------------------: | --------: | ---------: | ---------: |
| web         | `route:client-entry`      |                 1285 |     257.0 | 164444.8ms |    260.4ms |
| web         | `route:module`            |                 1285 |     257.0 |   1076.2ms |     13.3ms |
| node        | `route:module`            |                 1285 |     257.0 |    451.0ms |      7.7ms |
| node        | `manifest:transform`      |                    5 |       1.0 |     28.4ms |      8.2ms |
| node        | `module:client-only-stub` |                    5 |       1.0 |     21.6ms |      7.9ms |
| node        | `route:split-exports`     |                 1390 |     278.0 |      3.6ms |      3.6ms |
| web         | `route:split-exports`     |                 2665 |     533.0 |      0.2ms |      0.1ms |
| web         | `manifest:stage`          |                    5 |       1.0 |      0.0ms |      0.0ms |
| web         | `manifest:transform`      |                    5 |       1.0 |      0.0ms |      0.0ms |

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
