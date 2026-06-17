# Benchmark Methodology: Precomputed `RouteChunkAnalysis` vs Per-Query/Per-Export Babel

This document defines the exact commands, fixtures, metrics, and comparison
procedure to evaluate replacing the current **lazy per-query / per-export**
Babel parse→traverse→generate behavior with a **precomputed
`RouteChunkAnalysis`** approach for route module splitting
(`future.v8_splitRouteModules`).

It is the methodology reference for downstream implementation tasks. No code
changes are required to run the **baseline** half; the **precompute** half needs
the implementation behind a toggle before its commands produce numbers.

---

## 1. What we are comparing

### Current behavior (lazy, per-query / per-export)

Source of truth: `src/route-chunks.ts`, `src/index.ts`, `src/manifest.ts`.

When `v8_splitRouteModules` is enabled, each route module is analyzed lazily
and redundantly across the build lifecycle:

| Call site                                         | Operation name            | What it triggers                                                   |
| ------------------------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| `route:client-entry` transform (`index.ts:1383`)  | `route:client-entry`      | `detectRouteChunksIfEnabled` → `hasChunkableExport` × 4 exports    |
| `route:split-exports` transform (`index.ts:1509`) | `route:split-exports`     | `detectRouteChunksIfEnabled` → `hasChunkableExport` × 4 exports    |
| manifest build (`manifest.ts:204`)                | (inside manifest staging) | `detectRouteChunksIfEnabled` → `hasChunkableExport` × 4 exports    |
| `?route-chunk=` query transform (`index.ts:1446`) | `route:chunk`             | `getRouteChunkIfEnabled` → `getChunkedExport`/`omitChunkedExports` |

Each `hasChunkableExport(name)` → `getExportDependencies()` → `codeToAst()`
(**Babel parse**) + `traverse()`. Each chunk extraction additionally calls
`generate()` and re-`codeToAst()`.

The `RouteChunkCache` (`Map` keyed by `cacheKey::suffix`, versioned by the raw
code string) memoizes within a single build, so the _first_ call per
`(module, op)` pays the parse/traverse and subsequent calls hit the cache.
**However** `codeToAst()` runs `structuredClone(...)` on **every** access,
including cache hits (`route-chunks.ts:93`), which is O(AST size). There are
also up to 5 `?route-chunk=` queries per splittable route (`main` + 4 client
exports), each a separate lazy entry point.

### Proposed behavior (precomputed `RouteChunkAnalysis`)

Parse **once**, traverse **once**, and in a single coordinated pass per route
module compute:

1. which of the 4 client exports are independently chunkable, and
2. the generated code string for every chunk (`main`, `clientAction`,
   `clientLoader`, `clientMiddleware`, `HydrateFallback`) that is actually
   present.

The result is a single `RouteChunkAnalysis` object cached once per module; all
downstream call sites (`route:client-entry`, `route:split-exports`, manifest,
and each `?route-chunk=` query) read from it instead of re-entering the Babel
pipeline. This eliminates the repeated `structuredClone` and the redundant
`getExportDependencies` traversals across call sites.

> The implementation lives behind a toggle so both halves can be measured on
> the same commit (see §3).

---

## 2. Representative route modules (fixtures)

Use the existing synthetic fixture generator (`scripts/benchmark/fixture.mjs`).
It produces deterministic route modules across a fixed export profile cycle:

```
['plain', 'ssr-data', 'split-client', 'split-client', 'ssr-data', 'client-server-imports']
```

Only `split-client` and `client-server-imports` profiles emit client exports
(`clientAction`, `clientLoader`, `clientMiddleware`, `HydrateFallback`) — i.e.
**4 of every 6 routes (~67%) are splittable**. `plain` and `ssr-data` routes
exercise the early-exit fast path (`code.includes(exportName)` guard at
`route-chunks.ts:863`). This mix already represents the realistic distribution.

**Why this is representative:**

- `split-client`: all 4 client exports + a `.client` import — the worst case for
  `generate()` (5 queries: main + 4 chunks).
- `client-server-imports`: mixed `.client`/`.server` imports — exercises import
  specifier filtering in `omitChunkedExports`/`getChunkedExport`.
- `plain`/`ssr-data`: non-splittable, measuring the fast-path / early-exit cost
  the precompute must not regress.

The only variant that exercises the route-chunk code path is **`ssr-esm-split`**
(`v8_splitRouteModules: true`, web/client environment). The non-split `ssr-esm`
variant is the **control** — it must show no measurable difference between
baseline and precompute, confirming the toggle is inert when splitting is off.

### Route counts

| Count | Purpose                                               |
| ----- | ----------------------------------------------------- |
| 48    | smoke / correctness                                   |
| 256   | primary comparison (default profile scale)            |
| 1024  | stress / scaling (does precompute win grow linearly?) |

---

## 3. Toggle for A/B comparison

The precompute implementation **must** be gated behind an opt-in so the same
commit can produce both halves of the comparison. Two acceptable shapes:

- **Env var** (simplest, no public API surface):
  `ROUTE_CHUNK_PRECOMPUTE=1` → precompute path; unset/`0` → current lazy path.
- **Future flag** under `pluginReactRouter({ future: { v8_routeChunkPrecompute } })`.

The fixture generator's `rsbuild.config.mjs` and the bench harness pass this
through via the build environment. The methodology commands below assume the
**env var** shape; if a future flag is used instead, substitute the config
knob.

---

## 4. Exact commands

All commands run from the repo root
(`/home/zack/projects/rsbuild-plugin-react-router`). GNU `time` (`/usr/bin/time
-v`) is present and is auto-detected by the harness.

### 4.1 Pre-flight (once per session)

```sh
git status --short                 # confirm clean tree
pnpm install                       # ensure node_modules
pnpm build                         # build dist/ (harness builds it once anyway)
node --version                     # record Node version (v22.x here)
```

### 4.2 End-to-end build benchmark (primary comparison)

This exercises the **full plugin** under a real Rsbuild production build — the
ground-truth measurement. It reuses `scripts/bench-builds.mjs` and the
`--filter` flag to isolate the split variant.

Run the **full `default` profile** for each toggle value. The emitted JSON
contains all four variants in one file, so you compare the
`synthetic-256-ssr-esm-split` row (the code path that changes) **and** the
`synthetic-256-ssr-esm` row (the non-split control) from the same run — no
filtering needed. Avoid `--filter` for the control: the harness uses substring
matching (`benchmark.id.includes(filter)`), so `"synthetic-256-ssr-esm"` also
matches the `-split` variant.

**Baseline (current lazy behavior):**

```sh
ROUTE_CHUNK_PRECOMPUTE=0 pnpm bench:baseline \
  --profile default \
  --iterations 8 --warmup 2 \
  --clean build \
  --format both \
  --out .benchmark/results/lazy
```

**Precompute:**

```sh
ROUTE_CHUNK_PRECOMPUTE=1 pnpm bench:baseline \
  --profile default \
  --iterations 8 --warmup 2 \
  --clean build \
  --format both \
  --out .benchmark/results/precompute
```

To save time when iterating, you may scope a single run to the split variant
with `--filter split` (matches only `synthetic-256-ssr-esm-split`), but the
definitive comparison uses the full profile so the control is captured
alongside.

### 4.3 Scaling sweep (does the win grow with route count?)

Use the `full` profile filtered to the split variant, which adds the 1024-route
fixture:

```sh
for PRECOMPUTE in 0 1; do
  ROUTE_CHUNK_PRECOMPUTE=$PRECOMPUTE pnpm bench:full \
    --profile full --filter split \
    --iterations 5 --warmup 1 \
    --clean build \
    --out .benchmark/results/scale-precompute-$PRECOMPUTE
done
```

### 4.4 Isolated micro-benchmark (parse/traverse/generate counts)

The end-to-end build bundles the route-chunk Babel work inside the
`route:client-entry`, `route:chunk`, and `route:split-exports` operation
buckets. To attribute cost **directly** to the analysis (independent of Rspack
overhead), add a standalone micro-benchmark that imports the analysis
functions and runs them over generated route modules in-process.

Proposed script: `scripts/bench-chunk-analysis.mjs` (to be created by the
benchmark-implementation task). It imports from the built package:

```js
import { generateSyntheticFixture } from './benchmark/fixture.mjs';
// route-chunks internals are not part of the public API; import the public
// entrypoints detectRouteChunksIfEnabled / getRouteChunkIfEnabled from dist,
// OR export a bench-only analyzeRouteModule() from src for direct timing.
```

Run shape:

```sh
node scripts/bench-chunk-analysis.mjs \
  --routes 256 --variant ssr-esm-split \
  --iterations 50 --warmup 5 \
  --mode lazy \
  --out .benchmark/results/micro-lazy.json

node scripts/bench-chunk-analysis.mjs \
  --routes 256 --variant ssr-esm-split \
  --iterations 50 --warmup 5 \
  --mode precompute \
  --out .benchmark/results/micro-precompute.json
```

High iteration count (50) is appropriate here because each iteration is a pure
in-memory function call (no process spawn), so variance is low and 50 samples
give a tight p95.

---

## 5. Metrics to capture

### 5.1 From the end-to-end harness (already wired)

The harness writes `baseline.json` + `baseline.md` containing:

| Metric                               | Source                                         | What it tells us                                             |
| ------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| `wallMs` (min/median/mean/p95/stdev) | `performance.now()`                            | total build time                                             |
| `userMs`                             | `/usr/bin/time -v` "User time"                 | CPU time in user mode                                        |
| `sysMs`                              | `/usr/bin/time -v` "System time"               | CPU time in kernel                                           |
| `maxRssKb`                           | `/usr/bin/time -v` "Maximum resident set size" | peak memory                                                  |
| `pluginOperations[].count`           | `[react-router:performance]` reports           | **parse/traverse invocation counts** (operation granularity) |
| `pluginOperations[].totalMs`         | same                                           | cumulative time per operation                                |
| `pluginOperations[].maxMs`           | same                                           | slowest single invocation                                    |

**CPU time** = `userMs + sysMs` (summarized independently, then added for the
comparison). This isolates plugin work from I/O / Rspack scheduling.

**Parse/traverse counts**: the relevant operation buckets are `route:chunk`,
`route:client-entry`, and `route:split-exports`. Their `.count` fields,
summed, are the proxy for "how many times the Babel pipeline was entered per
route." The precompute path should reduce `route:chunk` and
`route:split-exports` totalMs without changing `.count` semantics (count stays
≈ routes, but totalMs drops), **unless** the implementation also adds a
dedicated `route:chunk-analyze` operation to expose the precompute pass
explicitly — then compare that new bucket's single-pass cost against the sum
of the old buckets.

**Generated-code cost**: the `route:chunk` operation's `totalMs` is dominated
by `generate()` plus the AST surgery in `getChunkedExport`/`omitChunkedExports`.
Compare `route:chunk.totalMs` between lazy and precompute directly.

### 5.2 From the micro-benchmark

| Metric                  | How                                                          |
| ----------------------- | ------------------------------------------------------------ |
| `parse` calls           | counter incremented in the `codeToAst` path                  |
| `traverse` calls        | counter in `getExportDependencies`                           |
| `generate` calls        | counter in `getChunkedExport`/`omitChunkedExports`           |
| `structuredClone` calls | counter in `codeToAst` (the per-access clone)                |
| analysis `totalMs`      | `performance.now()` around the full analyze-all-modules loop |
| per-route `meanMs`      | `totalMs / routeCount`                                       |
| heap delta              | `process.memoryUsage().heapUsed` before/after the loop       |

These direct counters are the cleanest evidence that precompute collapses N
parses into 1 and removes the repeated `structuredClone`.

### 5.3 Memory impact

Two views:

- **Peak RSS** from the end-to-end harness (`maxRssKb.p95`) — includes Rspack,
  so expect a small relative delta; use this for the user-facing "did peak
  memory get worse" question.
- **Heap delta** from the micro-benchmark — isolates the analysis's own
  retained memory (the precomputed `RouteChunkAnalysis` objects are held for
  the build lifetime; quantify their size vs the lazy cache's transient
  entries).

---

## 6. Iterations and warmup

| Benchmark                      | Warmup | Measured | Rationale                                                                                          |
| ------------------------------ | ------ | -------- | -------------------------------------------------------------------------------------------------- |
| End-to-end (`bench:baseline`)  | 2      | 8        | process spawn + Rspack JIT warmup dominate; 2 warmups stabilize, 8 samples give a usable p95/stdev |
| Scaling (`bench:full`)         | 1      | 5        | 1024-route builds are slow; 5 samples balance time vs signal                                       |
| Micro (`bench-chunk-analysis`) | 5      | 50       | in-memory, low variance; tight statistics needed to see sub-millisecond wins                       |

Always use `--clean build` for end-to-end runs (removes `build/` and
`.react-router/` between iterations) so each iteration is a cold plugin pass,
not a cache-rebuild. Do **not** use `--clean cold` (deletes `node_modules`) for
performance runs — it measures `pnpm install`, not the plugin.

Run both halves (lazy + precompute) **back-to-back on the same machine with no
other load**, and pin the same Node version. Record `git rev-parse HEAD` (the
harness embeds `commit` in the JSON output automatically).

---

## 7. Comparison procedure

### 7.1 End-to-end

1. Load `.benchmark/results/lazy/baseline.json` and
   `.benchmark/results/precompute/baseline.json`.
2. For the `synthetic-256-ssr-esm-split` benchmark, compare:
   - `summary.userMs.median` + `summary.sysMs.median` → **CPU time delta**
   - `summary.wallMs.median` → total build delta
   - `summary.maxRssKb.p95` → memory delta
   - `pluginOperations` where `operation ∈ {route:chunk, route:client-entry,
route:split-exports}`: `totalMs` and `maxMs` deltas.
3. Repeat for the 1024-route split fixture from the scaling run.
4. Confirm the **non-split control** (`ssr-esm`, no split) shows no statistically
   meaningful difference (medians within ~1 stdev). If it diverges, the toggle
   is leaking into the non-split path — that's a bug, not a result.

### 7.2 Micro

1. Load the two micro JSON files.
2. Compare absolute counters: `parse`, `traverse`, `generate`,
   `structuredClone` call counts per route. Expected: precompute shows
   `parse = routeCount` (1 per module) vs lazy's `parse ≤ 5×routeCount` and
   `structuredClone` ≈ 0 (precompute keeps one AST, not re-cloning).
3. Compare `per-route meanMs` and `heap delta`.

### 7.3 Reporting

Produce a single comparison table:

```
| Metric (256 routes, split)        | Lazy      | Precompute | Δ        |
|-----------------------------------|-----------|------------|----------|
| CPU time median (s)               | ...       | ...        | ...%     |
| Wall median (s)                   | ...       | ...        | ...%     |
| Peak RSS p95 (MB)                 | ...       | ...        | ...%     |
| route:chunk totalMs               | ...       | ...        | ...%     |
| route:split-exports totalMs       | ...       | ...        | ...%     |
| micro: parse calls / route        | ...       | ...        | ...%     |
| micro: traverse calls / route     | ...       | ...        | ...%     |
| micro: generate calls / route     | ...       | ...        | ...%     |
| micro: structuredClone / route    | ...       | ...        | ...%     |
| micro: analyze mean ms / route    | ...       | ...        | ...%     |
| micro: heap delta (MB)            | ...       | ...        | ...%     |
```

Fill from real runs. A result is a **win** if CPU time and `route:chunk`
totalMs drop with no peak-RSS regression beyond the retained
`RouteChunkAnalysis` heap cost (quantified separately).

---

## 8. Hygiene

- Benchmark output lives under gitignored `.benchmark/`. Never commit results.
- Clean generated data with `rm -rf .benchmark/` — **not** `git clean -fdX`,
  which also deletes `node_modules/` and `.tracedecay/` indexes.
- Start and end every comparison session with `git status --short`.
- Keep the fixture generator deterministic (no `Date.now()` / `Math.random()`
  in route content) so lazy vs precompute run against byte-identical inputs.
