# Lexer-assisted route export analysis triage

Branch: `perf/bundling-performance`
Commit: `c2452de1393264c2b01ef8aa03908077bce025db`
Task: `t_a0ef9422`

## Conclusion

Do not implement a standalone lexer-first route-export discovery change.

`es-module-lexer` is already in the hot path, but only after `transformToEsm` has produced parseable ESM (`src/export-utils.ts:52-81`, `src/index.ts:1377-1378`, `src/index.ts:1749-1762`). For route modules, the transform is still load-bearing for TS/TSX/JSX, default-export normalization, and route-chunk analysis. A lexer-first experiment that skips the client-entry warmup only shifts the same transform cost into `route:module`; it does not create a real build-time win.

The smallest safe optimization path is not “lexer first”, but a unified bundler-side route analysis cache that shares `{ transformed code, export names, optional chunk info }` across the existing transform hooks while keeping `route:client-entry` as the cache warmer.

## Code-path evidence

Current route analysis is split across two layers:

1. Shared helper caches in `src/export-utils.ts`
   - `transformCache` keyed by `(resourcePath, source)` at `src/export-utils.ts:24-24`
   - `exportNamesCache` keyed by transformed `code` at `src/export-utils.ts:25-25`
   - `routeModuleAnalysisCache` keyed by `(resourcePath, mtime, size)` for disk reads at `src/export-utils.ts:26-29`, `src/export-utils.ts:130-156`

2. Bundler hooks in `src/index.ts`
   - `route:client-entry` transforms + lexes + route-chunk detects at `src/index.ts:1367-1411`
   - `route:split-exports` transforms + route-chunk detects + lexes at `src/index.ts:1476-1549`
   - `route:chunk` transforms + chunk-generates at `src/index.ts:1414-1474`
   - `route:module` transforms + SPA export validation + default-export rewrite + Babel parse/generate at `src/index.ts:1737-1825`

The important point is that `route:client-entry` currently warms `transformCache` before `route:module` runs. Keeping that warmup matters because `route:module` still requires transformed code for correctness work that cannot be done from a raw lexer scan.

## Design comparison

| Design                          | What changes                                                                                                                                                                   | Upside                                                                                                          | Why it fails / succeeds                                                                                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current transform-warming path  | Leave `route:client-entry` as `transformToEsm(args.code)` + `getExportNames(code)` and let `route:module` reuse the cache                                                      | Correct today; required transform work is paid once when `args.code` matches disk/bundler content               | Still has duplicate call sites and repeated bookkeeping across hooks, but the expensive transform is already shared through `transformCache`                                                                                                      |
| Lexer-first + transform prewarm | Discover exports earlier with `es-module-lexer`, but still fire `transformToEsm` to warm later hooks                                                                           | Looks cheaper on paper if you count only export extraction                                                      | No real net win for route modules: TS/TSX/JSX cannot be lexed directly, so you still need `transformToEsm`; if you skip that warmup the cost just moves into `route:module`; if you keep it, you have nearly the same work plus more coordination |
| Unified route analysis cache    | Cache bundler-side analysis once per `(resourcePath, args.code)` and reuse it across `route:client-entry`, `route:split-exports`, `route:module`, and optionally `route:chunk` | Attacks the actual duplication boundary: repeated “transform → export scan → maybe route-chunk detect” preludes | Safest real improvement path. Must preserve hook-specific post-processing and keep route-chunk work lazy/off unless needed                                                                                                                        |

## Correctness constraints that any redesign must preserve

1. TS / TSX / JSX / MTS inputs still require esbuild loader normalization
   - `JS_LOADERS` maps `.ts/.tsx/.jsx/.js/.mjs/.mts` to esbuild loaders in `src/constants.ts:3-19`.
   - `transformToEsm` depends on that loader selection in `src/export-utils.ts:47-67`.
   - Raw `es-module-lexer` on source text is therefore unsafe for common route files.

2. `route:module` still needs transformed code beyond export discovery
   - SPA-mode validation reads export names from transformed code at `src/index.ts:1755-1790`.
   - The default export is normalized with a regex rewrite at `src/index.ts:1792-1805` before Babel parses the module.
   - Any shared cache must either return pre-rewrite transformed code plus let `route:module` keep this rewrite, or explicitly model a separate post-processed `routeModuleCode` variant.

3. Re-export behavior is intentionally narrow for route modules
   - Route-module paths use `getExportNames(code)` only (`src/export-utils.ts:83-104`, `src/index.ts:1378`, `src/index.ts:1762`).
   - The only place that resolves `export * from` recursively is the `.client` stub path via `getExportNamesAndExportAll` at `src/export-utils.ts:106-127` and `src/index.ts:1588-1722`.
   - A lexer-first refactor must not accidentally expand or break route-module export semantics around re-exports without an intentional product decision.

4. Route-chunk mode depends on the same transformed code string and lazy chunk analysis
   - `detectRouteChunksIfEnabled` and `getRouteChunkIfEnabled` both key off normalized file path + exact `code` string in `src/route-chunks.ts:835-889`.
   - `route:client-entry`, `route:split-exports`, and `manifest.ts` all feed the same transformed code shape into that cache.
   - A redesign that makes the code strings diverge will silently defeat chunk-cache reuse.

5. Manifest/disk-path unification still has one raw-source dependency today
   - `manifest.ts` uses `source` for the dev CSS fallback regex at `src/manifest.ts:191-199`.
   - If future work merges disk and bundler analysis more aggressively, that fallback either needs to move to transformed `code` or remain available separately.

## Benchmark evidence from this run

Artifacts:

- `.benchmark/results/triage-smoke-current/baseline.json`
- `.benchmark/results/triage-default-current/baseline.json`

Commands run:

```sh
node scripts/bench-builds.mjs \
  --profile smoke \
  --iterations 1 \
  --warmup 0 \
  --format both \
  --out .benchmark/results/triage-smoke-current

node scripts/bench-builds.mjs \
  --profile default \
  --iterations 1 \
  --warmup 0 \
  --clean build \
  --format both \
  --out .benchmark/results/triage-default-current
```

Observed results:

### Smoke (48-route SSR ESM)

- Wall: `1071.2 ms`
- Max RSS: `307152 kB`
- Web compiler lifecycle: `760.9 ms`
- Node compiler lifecycle: `845.5 ms`
- Web `route:client-entry.totalMs`: `1712.3 ms`
- Web `route:module.totalMs`: `73.6 ms`

### 256-route non-split vs split (same run, same commit)

Non-split `synthetic-256-ssr-esm`

- Wall: `1937.2 ms`
- Max RSS: `501884 kB`
- Web compiler lifecycle: `1250.2 ms`
- Node compiler lifecycle: `1446.1 ms`
- Web `route:client-entry.totalMs`: `36337.2 ms`
- Web `route:module.totalMs`: `240.8 ms`

Split `synthetic-256-ssr-esm-split`

- Wall: `2201.0 ms`
- Max RSS: `694036 kB`
- Web compiler lifecycle: `1681.9 ms`
- Node compiler lifecycle: `1872.9 ms`
- Web `route:client-entry.totalMs`: `76313.8 ms`
- Web `route:module.totalMs`: `224.2 ms`
- Web `route:chunk.totalMs`: `84524.4 ms`

Delta (split - non-split)

- Wall: `+263.8 ms` (`+13.6%`)
- Max RSS: `+192152 kB` (`+38.3%`)
- Web compiler lifecycle: `+431.7 ms`
- Node compiler lifecycle: `+426.8 ms`
- Web `route:client-entry.totalMs`: `+39976.6 ms`
- Web `route:module.totalMs`: `-16.6 ms`

Interpretation:

- The split build’s extra cost is not showing up as a `route:module` surge.
- The big additional work is in `route:chunk` plus heavier `route:client-entry`/split-route activity.
- That makes the earlier “move lexer work out of client-entry” idea especially unconvincing: `route:module` is not the dominant split-build hotspot here, and simply relocating transform cost there is unlikely to improve total wall time.

Important caveat: `totalMs` overcounts concurrent async spans, so the ground-truth numbers here are wall-clock and compiler lifecycle times, not the raw sums of per-resource totals.

## Smallest safe implementation path

If we do follow-up work, it should be this, in order:

1. Add a bundler-side route-analysis helper/cache
   - Touch: `src/export-utils.ts` or a new helper module.
   - Shape: cache by `(resourcePath, args.code)` and return a promise for
     `{ code, exportNames, chunkInfo? }`.
   - Keep chunk info lazy so non-split routes do not pay Babel parse/traverse cost.

2. Swap the three main hook preludes onto that helper
   - Touch: `src/index.ts:1367-1411`, `src/index.ts:1476-1549`, `src/index.ts:1737-1825`.
   - `route:client-entry` remains the warm path.
   - `route:module` consumes the shared transformed code and keeps its SPA validation + default-export rewrite.
   - `route:split-exports` consumes shared export names and shared/lazy chunk info.

3. Only then consider manifest/prerender dedup
   - Touch later: `src/manifest.ts:185-238`, `src/index.ts:758-778`.
   - First move the CSS fallback off raw `source` (`src/manifest.ts:191-199`), then thread export names/analysis out of manifest generation so prerender validation stops re-walking routes.

This is the smallest path that can plausibly reduce real work instead of shuffling it between hooks.

## Recommendation

Reject a standalone lexer-first route-export-discovery change as “not worth it”.

Recommended follow-up instead:

- Implement a unified bundler-side route analysis cache.
- Measure it with the existing harness.
- Keep the disk/manifest-side dedup as a second phase only after the bundler-side helper proves a wall-clock win.

Suggested follow-up card title:

- `Implement unified bundler-side route analysis cache (keep client-entry transform warmup)`

Suggested benchmark commands for that future A/B:

```sh
# quick correctness / smoke
node scripts/bench-builds.mjs \
  --profile smoke \
  --iterations 1 \
  --warmup 0 \
  --format both \
  --out .benchmark/results/<change>-smoke

# canonical 256-route comparison: compare split and non-split rows from the same JSON
node scripts/bench-builds.mjs \
  --profile default \
  --iterations 5 \
  --warmup 1 \
  --clean build \
  --format both \
  --out .benchmark/results/<change>-baseline
```

For final sign-off, the stronger profile from the existing methodology docs is still appropriate:

```sh
node scripts/bench-builds.mjs \
  --profile default \
  --iterations 8 \
  --warmup 2 \
  --clean build \
  --format both \
  --out .benchmark/results/<change>-final
```
