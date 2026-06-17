# Profiler Timing Semantics & Concurrency Overcount Analysis

**Task:** t_f5a0df72 — Decide profiler operation timing semantics and overcount risk
**Scope:** `src/performance.ts` and its 8 call sites in `src/index.ts`. Analysis only — no code changes.
**Branch:** perf/bundling-performance @ c2452de

---

## 1. What the profiler measures today

`createReactRouterPerformanceProfiler` exposes three methods:

| Method                                        | Clock                                                                                   | Wraps                                 | Suspends?                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------- |
| `record(env, op, resource, () => Promise<T>)` | `performance.now()` wall-clock: `start` before callback, delta captured in `.finally()` | an async callback                     | **Yes** — the callback `await`s off-thread work |
| `recordSync(env, op, resource, () => T)`      | `performance.now()` wall-clock: `start` before, delta in `finally`                      | a sync callback                       | No                                              |
| `flush(env, { compilerLifecycleMs })`         | —                                                                                       | emits one JSON report per environment | —                                               |

Every measurement is a **wall-clock delta** (`performance.now()`). Nothing attempts CPU-exclusive accounting. `record` measures start→settle; `recordSync` measures start→return.

`compilerLifecycleMs` (set in `index.ts:481-484`) is a single wall-clock span from `setupStartMs` (`performance.now()` at plugin setup, `index.ts:132`) to `onAfterEnvironmentCompile`. It is the **one authoritative end-to-end wall time** and is never summed, so it carries no internal double-count.

### The 8 call sites (all in `src/index.ts`)

| #   | Op name                    | Method       | Line | Hook trigger                                                    | Async waits in body                                                 |
| --- | -------------------------- | ------------ | ---- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | `manifest:stage`           | `recordSync` | 1263 | `onManifest` callback (sync)                                    | none (sync)                                                         |
| 2   | `manifest:transform`       | `record`     | 1329 | `api.transform` test: virtual manifest                          | `getReactRouterManifestForDev` (I/O)                                |
| 3   | `route:client-entry`       | `record`     | 1372 | `api.transform` resourceQuery: build-client-route               | `transformToEsm`, `getExportNames`, `detectRouteChunksIfEnabled`    |
| 4   | `route:chunk`              | `record`     | 1419 | `api.transform` resourceQuery: route-chunk=                     | `transformToEsm`, `parse`                                           |
| 5   | `route:split-exports`      | `record`     | 1481 | `api.transform` test: `/.[cm]?[jt]sx?$/` (**every JS/TS file**) | `transformToEsm`, `detectRouteChunksIfEnabled`, `getExportNames`    |
| 6   | `module:server-only-guard` | `record`     | 1557 | `api.transform` test: `.server` files                           | none real — body throws/returns synchronously                       |
| 7   | `module:client-only-stub`  | `record`     | 1579 | `api.transform` test: `.client` files                           | `transformToEsm`, `getExportNamesAndExportAll`, recursive `resolve` |
| 8   | `route:module`             | `record`     | 1742 | `api.transform` resourceQuery: `?react-router-route`            | `transformToEsm`, `getExportNames`                                  |

The async helpers (in `src/export-utils.ts`) are the suspension points:

- `transformToEsm` → `esbuild.transform()` — **off-thread** (esbuild runs in a child thread/process); a genuine wait that yields the event loop.
- `getExportNames` → `es-module-lexer` `init` (WASM, async first call) + `parseExports` (sync). Yields at least one microtask.
- `getReactRouterManifestForDev`, `detectRouteChunksIfEnabled` → async I/O / cached analysis.

---

## 2. The concurrency overcount mechanism

All 7 `record()` sites are `api.transform()` hooks = **per-module** transforms. Rsbuild/Rspack processes the module graph with many modules in flight; the JS transform callbacks share the single Node.js event loop and **interleave at `await` points**.

When module A's transform `await`s `esbuild.transform()` (off-thread), control returns to the event loop and module B's transform starts and runs. Both A's and B's `performance.now()` spans are "ticking" simultaneously:

```
event loop timeline ─────────────────────────────────────────►
A span:  [████ await(esbuild A) ░░░░ run B's sync ░░░ ████ resume A ████]
B span:               [██ run sync ░░░ await(esbuild B) ░░░ resume B ██]
                                ▲ overlap region ▲
```

Each span's wall delta includes the **overlap region**. Effects on the aggregate fields in `OperationTiming`:

- **`totalMs`** (sum of per-resource wall deltas) **overcounts.** Summing overlapping intervals bills the overlap to both operations. With N route modules transformed concurrently, `totalMs` for `route:module` can approach `N × (per-module wall)` instead of the true serial cost; in the worst case `Σ totalMs` across all operations **exceeds `compilerLifecycleMs`**, which is a physical impossibility for non-overlapping work — the giveaway that double-counting occurred.
- **`maxMs` and `slowest[]`** are **accurate per-resource** — they are single end-to-end wall deltas for one resource, never summed, so they carry no internal double-count. They remain valid for "which single resource is slowest."
- **`count`** is **accurate** — it is incremented once per invocation regardless of overlap.

No `record()` callback contains an internal `Promise.all` over multiple modules (verified: the only `Promise.all` call sites are in `build-manifest.ts`, `manifest.ts`, `react-router-config.ts`, and `index.ts:977` — none inside a transform hook body). So the overlap is **sibling (peer) overlap between different modules**, not parent/child nesting within one span.

---

## 3. Recommendation — what to report

**Report BOTH wall-clock and a concurrency-aware "exclusive" aggregate, each clearly labeled, and make `compilerLifecycleMs` the headline total.** They answer different questions and neither alone is sufficient:

| Metric                                     | Question it answers                                                              | Verdict                                                                                                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `compilerLifecycleMs` (wall, single span)  | "How long did the user wait for this build?"                                     | **Keep — authoritative total.** Promote it as the headline number.                                                                                                         |
| `maxMs` / `slowest[]` (wall, per-resource) | "Which individual module is the worst offender?"                                 | **Keep as-is — accurate, no double-count.** This is the most actionable field.                                                                                             |
| `count`                                    | "How many modules hit this transform?"                                           | **Keep — accurate.**                                                                                                                                                       |
| `totalMs` (sum of wall spans)              | "What is this operation class's total cost?"                                     | **Misleading as written** — overcounts under concurrency. Either rename to `totalWallMs` with an explicit caveat, or replace with an interval-aware aggregate (see below). |
| **NEW: `exclusiveMs` / `wallMs`**          | "How much real serial time did this operation consume, deduped against overlap?" | **Add** — gives a cost number you can actually sum and compare.                                                                                                            |

**Why not "exclusive CPU only"?** Most of the wall time in these spans is **wait** on esbuild/Rspack threads (off-process), not synchronous JS CPU. An "exclusive CPU" metric would systematically understate the operations that actually dominate build time (the esbuild transforms), giving a false picture. The useful split is _wall-clock-per-resource_ (already correct) vs _concurrency-deduped aggregate_ (missing), not _CPU-vs-wall_.

---

## 4. Practical approach for the concurrency-aware aggregate

Ranked by practicality for this plugin.

### Recommended: interval-union accounting in `flush()` (Option D)

Store each `record()` span as a `[start, end]` interval keyed by `(environment, operation)`. At `flush()`, run a sweep-line:

1. Sort the intervals for each operation by start.
2. Merge overlapping intervals into disjoint ranges; sum their lengths → **`wallMs`** = distinct wall time this operation occupied (deduped against its _own_ overlapping resources).
3. Optionally, for a cross-operation view, do the same sweep over **all** operations' intervals together and compare the union length to `compilerLifecycleMs` to report an **overcount ratio** (`Σ totalMs / unionWallMs`).

Why this fits: all needed data (start/end per resource) is **already captured** — `record` already calls `performance.now()` twice. The change is to persist the interval instead of immediately collapsing to a scalar in `recordDuration`, then compute the union once at flush. Memory cost is O(total module × operation invocations), bounded and fine for builds with a few thousand modules. No per-`await` instrumentation needed; the 7 call sites stay untouched.

```
// sketch (not applied — analysis only)
type Interval = [start: number, end: number];
// store intervalsByEnv: Map<env, Map<op, Interval[]>>
// in flush: sort + merge + sum → wallMs; report overcount = totalMs / wallMs
```

### Fallback: span-tree self-time subtraction (Option C)

Use `AsyncLocalStorage` to maintain a stack of active spans; when a child span starts under an active parent, subtract the child's duration from the parent's "self" time (standard OpenTelemetry self-time). **Caveat:** this only fixes _parent/child nesting_; it does **not** fix sibling overlap, and here the dominant overcount is sibling overlap (two independent modules). So Option C alone is insufficient for this plugin. Use it only if you also want per-span self attribution alongside Option D.

### Not recommended: `process.cpuUsage()` deltas (Option A)

`process.cpuUsage()` is process-global and sampled per-span, but on a single-threaded event loop the CPU time between a span's start and end includes CPU time spent on _other_ interleaved spans' synchronous code — it attributes no better than `performance.now()` for overlapping spans. Worse, it would **undercount** the real cost drivers (esbuild/Rspack run in separate threads/processes, so their CPU time is invisible to the JS process's `cpuUsage`). It is useful for exactly one thing: a **process-level CPU-utilization sanity check** (`cpuUsage total / compilerLifecycleMs`) to show how much of the build wall time was JS-process CPU vs waiting. Use it for that ratio only, never for per-span attribution.

### Not recommended: bracket every `await` (Option B)

Manually accumulate on-CPU time across sync segments, stopping at each `await` suspension. Requires instrumenting multiple await points across 7 call sites — invasive, fragile, high maintenance. Skip.

---

## 5. Documentation paragraph (ready to paste)

> **Timing semantics — concurrency overcount caveat.**
> Operation timings reported by this profiler are measured with `performance.now()` wall-clock deltas: each `record()` call captures the interval from when an async transform callback starts to when its returned promise settles. Because Rsbuild/Rspack processes many modules concurrently and the per-module transform callbacks interleave on the Node.js event loop at `await` points (notably `esbuild.transform()` and `es-module-lexer` parsing), the wall-clock spans of different modules **overlap in time**. As a result, `totalMs` — the sum of per-resource wall deltas for an operation — **double-counts overlapping wait time** and can exceed the actual serial cost of that operation; summed across all operations it can even exceed `compilerLifecycleMs`, the single authoritative end-to-end build wall time. Treat `totalMs` as an upper bound on cost, not a precise attribution. The fields that remain accurate regardless of concurrency are `count` (invocations), `maxMs` (worst single resource), and `slowest[]` (per-resource wall deltas), because these are never summed across resources. `compilerLifecycleMs` is the ground-truth total wall time. When you need a concurrency-safe cost number that can be summed across operations, use the interval-union `wallMs` aggregate instead of `totalMs`.

---

## 6. High-risk operations for overcount

Risk = (resource count, i.e. how many modules trigger it) × (number/depth of genuine async suspension points, i.e. how much wall time is interleavable wait).

| Op name                         | Risk            | Why                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `route:split-exports`           | **Very high**   | Triggered by `test: /\.[cm]?[jt]sx?$/` — matches **every** JS/TS/JSX/TSX file in the build, not just routes. Highest `count` of any op. Body has 3 sequential awaits (`transformToEsm` → `detectRouteChunksIfEnabled` → `getExportNames`), each a suspension point. Maximum modules × maximum awaits = maximum overlap, so `totalMs` inflates the most here. |
| `route:module`                  | **High**        | One per route module (`?react-router-route` query). Awaits `transformToEsm` (off-thread esbuild) + `getExportNames`. Many route modules transformed concurrently → many overlapping spans.                                                                                                                                                                   |
| `route:client-entry`            | **High**        | One per client route module. Three awaits including off-thread `transformToEsm`. Same inter-module overlap pattern as `route:module`.                                                                                                                                                                                                                        |
| `route:chunk`                   | **Medium-high** | One per route-chunk export. Awaits `transformToEsm` + `parse`. Fewer resources than `route:module` (only when `splitRouteModules` is on), but still per-chunk concurrency.                                                                                                                                                                                   |
| `module:client-only-stub`       | **Medium**      | Few resources (`.client` modules are rare), but each span is long with many awaits (`transformToEsm`, `getExportNamesAndExportAll`, recursive synchronous `resolve` with `statSync`/`existsSync` bursts). Per-span wall is large, so even modest overlap distorts `totalMs`.                                                                                 |
| `manifest:transform`            | **Medium-low**  | Matches only virtual manifest resources (browser + per-bundle server) → very low `count`, so little _intra-operation_ overlap. But its `getReactRouterManifestForDev` await (I/O) overlaps with route transforms, so it contributes to _cross-operation_ overcount when sums are compared.                                                                   |
| `module:server-only-guard`      | **Low**         | Callback body is effectively synchronous — it either throws immediately (web) or returns synchronously (node). No real `await` suspension, so spans are ~0 ms and do not meaningfully overlap.                                                                                                                                                               |
| `manifest:stage` (`recordSync`) | **None**        | Synchronous by construction (`recordSync`). Wall-clock ≈ CPU; no concurrency, no overcount.                                                                                                                                                                                                                                                                  |

**Bottom line:** the three broad-trigger per-module transforms — `route:split-exports`, `route:module`, and `route:client-entry` — are where `totalMs` diverges most from real cost, because they combine high invocation counts with multiple off-thread await points. These are the operations that most need the interval-union `wallMs` treatment (Section 4) and whose `totalMs` should carry the explicit caveat in any report.

---

## 7. Summary of deliverables

1. **Recommendation:** Report both — keep wall-clock per-resource diagnostics (`maxMs`, `slowest`, `count`) and the authoritative `compilerLifecycleMs` total; add a concurrency-aware aggregate (`wallMs` via interval-union) to replace the misleading `totalMs` for any cross-operation or cost-summing use. Do **not** pursue CPU-exclusive-only measurement (it would hide the esbuild/Rspack wait that actually dominates build time).
2. **Exclusive-ish approach:** Interval-union accounting computed in `flush()` from already-captured `[start,end]` spans (Option D) — accurate, no await instrumentation, 7 call sites untouched. `process.cpuUsage()` only for an optional process-level CPU-utilization ratio, never per-span.
3. **Documentation paragraph:** Section 5 above, ready to paste as a code comment in `performance.ts` or a README section.
4. **High-risk ops:** `route:split-exports` (very high), `route:module` (high), `route:client-entry` (high), `route:chunk` (medium-high), `module:client-only-stub` (medium); `manifest:transform` (medium-low, cross-op only); `module:server-only-guard` (low); `manifest:stage` (none, sync).
