# Unified Route Module Analysis Cache Triage

Task: `t_07287a3f`
Branch: `perf/bundling-performance` @ `c2452de`
Scope: design-only synthesis for a unified per-route analysis cache spanning `src/export-utils.ts`, `src/manifest.ts`, `src/index.ts`, and `src/route-chunks.ts`.

Inputs synthesized:

- `route-analysis-duplication-audit.md`
- `.benchmark/design/manifest-route-analysis-triage.md`
- `.benchmark/design/shared-route-analysis-cache-proposal.md`
- `.benchmark/design/test-impact-plan-shared-cache.md`
- `task/route-chunk-precompute-plan.md`
- live code in `src/export-utils.ts`, `src/manifest.ts`, `src/index.ts`, `src/route-chunks.ts`

---

## 0. Headline answer

The repo already shares low-level transform/export caches in `src/export-utils.ts:24-29` and a per-plugin `routeChunkCache` in `src/index.ts:403-409`, but it still duplicates higher-level route analysis because manifest generation, prerender validation, and three build transforms each reconstruct overlapping facts from the same route module.

Recommended direction:

1. Introduce a plugin-instance-scoped `RouteAnalysisCache` beside `routeChunkCache`.
2. Make it the single source of truth for:
   - transformed ESM code,
   - export-name list,
   - manifest booleans,
   - dev CSS fallback bit,
   - route chunk metadata,
   - future pointer to the single-pass `RouteChunkAnalysis` object proposed for `src/route-chunks.ts`.
3. Keep build/dev/root-route/split-mode guards outside the base cache entry where possible so one source analysis can be safely reused across callers.
4. Remove the prerender re-extraction pass in `src/index.ts:758-762` by threading route analysis out of manifest generation.
5. Treat raw-source web entry emission in `src/index.ts:433-450` as a follow-up hardening step unless it can be safely switched to the same cache without changing config timing.

---

## 1. Current consumers: what each caller needs

### 1.1 Shared low-level helpers

`src/export-utils.ts`

- `transformToEsm(code, resourcePath)` at `:52-80`
- `getExportNames(code)` at `:83-104`
- `getRouteModuleAnalysis(resourcePath)` at `:130-157`
- `getRouteModuleExports(resourcePath)` at `:159-163`

Current caches:

- `transformCache` keyed by `resourcePath` and validated by exact source string (`src/export-utils.ts:24,56-59`)
- `exportNamesCache` keyed by transformed `code` (`src/export-utils.ts:25,83-104`)
- `routeModuleAnalysisCache` keyed by `resourcePath` and validated by `mtimeMs + size` (`src/export-utils.ts:26-29,133-155`)

### 1.2 Consumer matrix

| Consumer                                        | Callsite                               |                                  Needs raw source? |                             Needs transformed code? |                                                Needs export names? |                                                     Needs route chunk info? |
| ----------------------------------------------- | -------------------------------------- | -------------------------------------------------: | --------------------------------------------------: | -----------------------------------------------------------------: | --------------------------------------------------------------------------: |
| Manifest generation                             | `src/manifest.ts:163-285`              | Yes today, only for dev CSS fallback at `:191-199` | Yes, for `detectRouteChunksIfEnabled` at `:202-210` |                     Yes, to derive manifest booleans at `:216-279` |                                                           Yes in build mode |
| Prerender validation                            | `src/index.ts:733-816`                 |                                                 No |                                                  No |                   Yes, via `getRouteModuleExports()` at `:758-762` |                                                                          No |
| Client-entry transform (`route:client-entry`)   | `src/index.ts:1368-1411`               |                                                 No |                    Yes, `transformToEsm` at `:1377` |                                   Yes, `getExportNames` at `:1378` |                           Yes, `detectRouteChunksIfEnabled` at `:1383-1389` |
| Route-chunk transform (`route:chunk`)           | `src/index.ts:1414-1474`               |                                                 No |               Yes, `transformToEsm` at `:1442-1445` | Yes, but only for generated main-chunk enforcement at `:1454-1465` | Yes, plus generated chunk body via `getRouteChunkIfEnabled` at `:1446-1452` |
| Split-exports transform (`route:split-exports`) | `src/index.ts:1476-1547`               |                                                 No |               Yes, `transformToEsm` at `:1504-1507` |                                   Yes, `getExportNames` at `:1519` |                           Yes, `detectRouteChunksIfEnabled` at `:1508-1514` |
| Route-module transform (`route:module`)         | `src/index.ts:1738-1824`               |                                                 No |                    Yes, `transformToEsm` at `:1749` |                       Yes in SPA mode, `getExportNames` at `:1762` |                                                                          No |
| Browser manifest emit hook                      | `src/modify-browser-manifest.ts:39-46` |                        Indirectly through manifest |                         Indirectly through manifest |                                        Indirectly through manifest |                                                 Indirectly through manifest |

### 1.3 Current duplication that matters

1. `getReactRouterManifestForDev()` can run up to three times per build:
   - prerender path: `src/index.ts:869-876`
   - node virtual server-manifest fallback: `src/index.ts:1352-1359`
   - browser emit hook: `src/modify-browser-manifest.ts:39-46`
2. prerender validation immediately re-reads route exports after manifest generation via `getRouteModuleExports()` (`src/index.ts:758-762`).
3. build transforms each replay some combination of `transformToEsm()`, `getExportNames()`, and `detectRouteChunksIfEnabled()` from bundler `args.code` rather than consuming one shared analysis object.
4. manifest dev CSS fallback still depends on raw `source` (`src/manifest.ts:191-199`), which is the only remaining raw-source-only consumer in the route analysis path.

---

## 2. Proposed unified cache shape

Base principle: cache the source-derived facts once per route file and make build/dev policy a caller concern, not a property of the base analysis entry.

Recommended module:

```ts
// src/route-analysis-cache.ts
export type RouteAnalysisCache = {
  getRouteAnalysis(args: RouteAnalysisRequest): Promise<RouteAnalysis>;
  getRouteAnalysisFromCode(
    args: RouteCodeAnalysisRequest
  ): Promise<RouteAnalysis>;
  invalidateFile?(filePath: string): void;
  clear?(): void;
};
```

Recommended stored shape:

```ts
type RouteAnalysis = {
  key: {
    filePath: string; // normalized absolute path, query stripped
    routeRelativePath: string; // normalized path relative to appDirectory
  };
  version: {
    mtimeMs: number;
    size: number;
    contentHash: string; // hash of raw source
  };
  code: string; // transformed ESM
  codeHash: string; // hash of transformed code
  exports: {
    exports: readonly string[];
    hasAction: boolean;
    hasLoader: boolean;
    hasClientAction: boolean;
    hasClientLoader: boolean;
    hasClientMiddleware: boolean;
    hasDefaultExport: boolean;
    hasErrorBoundary: boolean;
    hasHydrateFallback: boolean;
  };
  css: {
    hasCssImport: boolean; // derived from transformed code, not raw source
  };
  chunks: {
    hasRouteChunks: boolean;
    hasRouteChunkByExportName: Record<RouteChunkExportName, boolean>;
    chunkedExports: readonly RouteChunkExportName[];
  };
  // optional future field when the route-chunk single-pass analysis lands:
  // routeChunkAnalysis?: InternalRouteChunkAnalysis;
};
```

### Why this shape works

- It covers every current caller without making them re-run analysis.
- It lets manifest reuse the same export list that prerender validation currently rebuilds.
- It keeps route chunk metadata alongside the same transformed code that generated it.
- It allows the route-chunk internal precompute plan to plug in later without changing external consumers again.

### Important design choice

Move the dev CSS fallback regex from raw `source` to transformed `code`.

Current regex in `src/manifest.ts:194`:

```ts
/\.(?:css|less|sass|scss)(?:\?[^'"`]+)?['"`]/;
```

That regex should remain, but be evaluated against `analysis.code`. This removes the only load-bearing raw-source requirement from manifest generation.

---

## 3. Cache keying and versioning

## 3.1 Primary key

Use normalized absolute file path with query string stripped:

```ts
const key = normalize(resolve(filePath)).split('?')[0];
```

## 3.2 Versioning strategy

Use a two-layer strategy.

### Disk-read path

For `getRouteAnalysis({ readFromDisk: true })`:

- primary lookup key: normalized absolute file path
- warm-hit guard: `mtimeMs + size`
- stale-hit confirmation: `contentHash` after read
- transformed-code equivalence diagnostic: `codeHash`

Why: `mtimeMs + size` is cheap for warm hits, while `contentHash` protects against edge cases where metadata changes but content does not, or content changes in a way the metadata check alone should not trust.

### Bundler-code path

For `getRouteAnalysisFromCode({ readFromDisk: false, sourceCode })`:

- primary lookup key: normalized absolute file path
- secondary version key: exact source variant / `codeHash`
- do not overwrite the disk-read entry with a bundler-source variant unless hashes match

Recommended representation:

```ts
type PerFileRouteAnalysisEntry = {
  disk?: CacheEntry;
  codeVersions: Map<string /* codeHash */, Promise<RouteAnalysis>>;
};
```

This is the safe answer to the current F-3 divergence: disk-source and bundler-source analysis for the same file can coexist without clobbering each other.

## 3.3 Build/dev/split-route safety

Do not encode `isBuild` or root-route suppression into the base route-analysis key.

Recommended split:

- base cache entry: source-derived facts only (`code`, `exports`, CSS bit, pure chunkability metadata)
- caller-side policy:
  - build vs dev decides whether chunk metadata is requested/used
  - root-route suppression remains in `detectRouteChunksIfEnabled`-style policy
  - `splitRouteModules` / `enforce` remain policy inputs, not source-version inputs

Reason: the same route file should be able to serve manifest, prerender, and transform callers without polluting one caller with another caller’s guard semantics.

If the implementation chooses to cache guard-applied route chunk results instead of pure chunkability, then the cache subkey must include:

- `splitRouteModules` mode (`false | true | 'enforce'`)
- normalized `rootRouteFile`
- normalized `appDirectory`
- caller intent (`detect` vs `getChunk`) because `detectRouteChunksIfEnabled` suppresses root routes while `getRouteChunkIfEnabled` does not (`src/route-chunks.ts:857-888`)

Recommended design: avoid this complexity by caching the pure analysis and applying caller policy after lookup.

---

## 4. Concurrency and failure hazards

These are the hazards the implementation must explicitly handle.

### H-1. Divergent disk vs bundler source versions

Current risk:

- manifest/prerender read from disk via `getRouteModuleAnalysis()`
- build transforms analyze `args.code`
- same path may produce different transformed inputs

Hazard:

- a resourcePath-only cache entry can be silently overwritten by a different source variant
- later callers observe misses or inconsistent chunk metadata without any explicit signal

Mitigation:

- keep separate per-file code-version entries
- compare `codeHash`/source identity in development and log or assert on divergence

### H-2. Rejected Promise poisoning

`transformToEsm()`, `getExportNames()`, and `getRouteModuleAnalysis()` already use delete-on-rejection logic (`src/export-utils.ts:69-74`, `95-100`, `144-149`). The unified cache must preserve that behavior.

Hazard:

- if a rejected in-flight Promise stays cached, every future caller fails forever until process restart

Mitigation:

- every Promise-backed cache layer must remove its own entry on rejection
- if a higher-level entry fans out into subentries (`disk`, `codeVersions`), rejection cleanup must remove the failed subentry only

### H-3. Stat/read race on disk files

Current `getRouteModuleAnalysis()` does `stat()` before deciding to reuse a cached Promise (`src/export-utils.ts:133-155`).

Hazard:

- file changes between `stat()` and `readFile()`
- metadata can drift while the content is already different

Mitigation:

- treat `mtimeMs + size` as a cheap warm-hit filter only
- canonicalize on `contentHash` after reading when metadata changed
- store `contentHash` in the entry so equivalent content can reuse transformed/export/chunk data even if metadata changed

### H-4. Guarded route-chunk results poisoning other callers

Current asymmetry:

- `detectRouteChunksIfEnabled()` suppresses root routes at `src/route-chunks.ts:860-861`
- `getRouteChunkIfEnabled()` does not apply the same root-route guard (`src/route-chunks.ts:884-888`)

Hazard:

- caching a final caller-shaped result instead of a pure analysis can make one caller's policy leak into another

Mitigation:

- cache pure analysis/chunkability only
- apply root/build/split guards outside the shared entry

### H-5. Shared AST mutation when route-chunk precompute lands

The route-chunk precompute plan already identifies `structuredClone()` as a correctness guard because chunk consumers mutate `ast.program.body` in place.

Hazard:

- if the unified cache later stores a shared `RouteChunkAnalysis.ast`, consumers can accidentally mutate it and poison every later read

Mitigation:

- keep the current clone-and-filter behavior until the single-pass route-chunk refactor lands
- when that refactor lands, use immutable/index-based metadata as proposed in `task/route-chunk-precompute-plan.md`
- add dev-only immutability guards/freeze assertions before sharing an AST object broadly

---

## 5. Exact tests that need coverage

The exact named tests are already spelled out in `.benchmark/design/test-impact-plan-shared-cache.md` and `task/route-chunk-correctness-test-spec.md`. The implementation should treat the lists below as the required coverage set.

### 5.1 New cache-layer tests

New file: `tests/route-analysis-cache.test.ts`

Required cases:

- `T-CACHE-01` warm-hit reuse
- `T-CACHE-02` mtime/size drift with identical content hash still reuses analysis
- `T-CACHE-03` content change recomputes analysis
- `T-CACHE-04` disk and bundler source variants for the same file do not overwrite each other
- `T-CACHE-05` bounded-cache eviction at the configured cap
- `T-CACHE-06` explicit `invalidateFile()` / `clear()` behavior
- `T-CACHE-07` dev diagnostic when disk and bundler code hashes diverge
- `T-CACHE-08` shared-consumer consistency between manifest and transform-hook callers

### 5.2 Manifest + prerender tests

Update/add in:

- `tests/manifest-split-route-modules.test.ts`
- `tests/manifest-version.test.ts`
- `tests/manifest.test.ts`
- `tests/index.test.ts`
- either export `validateSsrFalsePrerenderExports` for direct testing or add dedicated cases through the plugin harness

Required named cases:

- `T-MAN-06` through `T-MAN-13`
- `T-MAN-14` through `T-MAN-16`
- `T-PRE-01` through `T-PRE-05`
- `T-IDX-01`

These specifically cover:

- dev CSS fallback parity after moving from raw `source` to transformed `code`
- manifest export-boolean parity
- build-only chunk metadata correctness and no cross-mode leakage
- serialized manifest staying free of internal cache fields
- removal of the `getRouteModuleExports()` re-extraction pass from prerender validation

### 5.3 Route-chunk passthrough tests

Update:

- `tests/route-chunks.test.ts`

Required shared-cache case:

- `T-CHUNK-01` cache-derived chunk metadata matches direct `detectRouteChunksIfEnabled()` behavior

In addition, the sibling route-chunk correctness/precompute work remains required because the unified cache will eventually point at that analysis:

- `D-Detect-01..08`
- `G-Gen-01..08`
- `F-Mode-01..03`
- `E-Root-01..04`
- `V-Enforce-01..04`
- `M-Manifest-01..06`
- `T-Transform-01..05`
- `C-Cache-01..06`

Source of truth: `task/route-chunk-correctness-test-spec.md` and `task/route-chunk-precompute-plan.md`.

### 5.4 serverBundles and SRI compatibility tests

Update/add:

- `tests/build-manifest.test.ts`
- new `tests/modify-browser-manifest.test.ts`

Required named cases:

- `T-BM-01`
- `T-BM-02`
- `T-SRI-01` through `T-SRI-05`

These prove:

- `build-manifest.ts` remains route-tree-only
- `serverBundles({ branch })` is not coupled to route-source analysis
- emitted manifest assets remain serializable/public-only
- SRI is still computed from emitted JS asset bytes only
- manifest chunk URLs still line up with emitted assets

### 5.5 Existing coverage gaps to close

These areas are currently effectively untested and should be considered mandatory coverage gaps:

- `src/modify-browser-manifest.ts` emit/SRI path
- `validateSsrFalsePrerenderExports()` in `src/index.ts:733-816`
- dev CSS fallback in `src/manifest.ts:191-199`
- cache behavior in `src/export-utils.ts`

---

## 6. Benchmark commands and counters

### 6.1 Primary before/after benchmark commands

From the existing methodology and scripts:

Canonical baseline:

```sh
pnpm bench:baseline
```

Equivalent explicit command:

```sh
node scripts/bench-builds.mjs \
  --profile default \
  --iterations 5 \
  --warmup 1 \
  --clean build \
  --format both \
  --out .benchmark/results/manifest-baseline
```

After the cache refactor:

```sh
node scripts/bench-builds.mjs \
  --profile default \
  --iterations 5 \
  --warmup 1 \
  --clean build \
  --format both \
  --out .benchmark/results/manifest-after-cache-dedup
```

Focused split-smoke run:

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

Existing package shortcut for the broader suite:

```sh
pnpm bench:full
```

### 6.2 Verification commands during implementation

```sh
pnpm exec rstest run
pnpm run build
pnpm run format
```

### 6.3 Counters to watch

Top-level counts should stay stable for the same fixture:

- `manifest:transform`
- `manifest:stage`
- `route:client-entry`
- `route:chunk`
- `route:split-exports`
- `route:module`

New lower-level counters worth adding or watching:

- `manifest:route-stat`
- `manifest:route-read`
- `manifest:route-transform-to-esm`
- `manifest:route-export-extract`
- `manifest:route-analysis`
- `manifest:route-map`
- `manifest:route-chunk-detect`
- `route-chunk:parse`
- `route-chunk:traverse`
- `route-chunk:structured-clone`
- `route-chunk:generate`

Success criterion:

- top-level transform counts remain stable
- direct route-analysis work drops
- route-chunk structured-clone overhead drops once the single-pass chunk-analysis follow-up lands

---

## 7. Recommended implementation breakdown

This should not be one commit. Minimum recommended sequence is three commits, with one optional hardening follow-up.

### Commit 1 — Introduce the cache as an orchestration layer

Files:

- create `src/route-analysis-cache.ts`
- wire creation in `src/index.ts` beside `routeChunkCache`
- keep using existing helpers from `src/export-utils.ts` and `src/route-chunks.ts`
- add `tests/route-analysis-cache.test.ts`
- add the passthrough test in `tests/route-chunks.test.ts`

Goal:

- prove the cache can wrap existing behavior without changing outputs

Merge gate:

- `T-CACHE-01,03,06,08`
- `T-CHUNK-01`
- `T-MAN-13`

### Commit 2 — Remove the raw-source-only manifest/prerender duplication

Files:

- `src/manifest.ts`
- `src/index.ts` (`validateSsrFalsePrerenderExports` path)
- `tests/manifest-split-route-modules.test.ts`
- `tests/manifest-version.test.ts`
- `tests/manifest.test.ts`
- `tests/index.test.ts` and/or dedicated prerender validation tests

Goal:

- move CSS fallback to transformed code
- thread route analysis out of manifest generation
- delete the `getRouteModuleExports()` re-extraction pass from prerender validation

Merge gate:

- `T-MAN-06..09`
- `T-PRE-01..05`
- `T-IDX-01`
- `T-MAN-14..16`

### Commit 3 — Convert transform/emit consumers to the shared cache

Files:

- `src/index.ts` transform hooks
- `src/modify-browser-manifest.ts`
- `tests/build-manifest.test.ts`
- new `tests/modify-browser-manifest.test.ts`

Goal:

- `route:client-entry`, `route:split-exports`, and `route:module` consume cached analysis
- browser-manifest emission receives the shared cache without changing SRI semantics

Merge gate:

- `T-BM-01..02`
- `T-SRI-01..05`
- transform-hook parity tests from the sibling chunk spec remain green

### Commit 4 — Optional hardening follow-up

Files:

- `src/index.ts` web route entry emission around `:433-450`
- possibly manifest staging/reuse paths

Goal:

- replace raw `source.includes(exportName)` entry emission with analysis-driven chunk entries
- investigate whether prerender can reuse a staged manifest instead of forcing another generation

This is optional because it may change config timing or asset-list behavior. Keep it separate from the main cache landing.

---

## 8. Bottom line

If the goal is a safe unified route-module analysis cache, the best path is:

1. keep one plugin-instance cache for source-derived route facts,
2. move CSS fallback onto transformed code,
3. thread manifest analysis into prerender validation,
4. let build transforms reuse the same analysis object,
5. preserve separate source versions for disk and bundler inputs,
6. leave entry-emission hardening as a follow-up unless it can be proven behavior-neutral.

That gives one analysis source of truth without breaking `serverBundles`, SRI, root-route chunk policy, or the future single-pass route-chunk plan.
