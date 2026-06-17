# Route Chunk Correctness — Test Specification

**Kanban:** `t_1c0421c6` (feeds triage `t_d3ed9b84` → plan `t_f8636ea4`)
**Branch:** `perf/bundling-performance` (PR #39)
**Status:** SPEC ONLY — no test bodies implemented. Each entry below is ready for an
implementer to write against. Behavior values marked **(verified)** were produced by
running the real `src/route-chunks.ts` functions against the listed fixtures on the
current head (`c2452de`); they are the golden values the tests must pin.

---

## 0. What this spec protects

A future change precomputes all chunk analysis for one route in a single parse/traverse
pass (see sibling tasks `t_0f2688a9`, `t_34486796`). That refactor must not change any
externally observable result. This spec defines the exact tests that lock the current
behavior so the precompute can be proven equivalent.

**The invariant, stated once:** For every route module, the triple
(detection result `RouteChunkInfo`, generated chunk code per `RouteChunkName`,
consumer-visible output in the rspack transforms and the React Router manifest) must be
byte-for-byte identical before and after the precompute refactor, across all five
dimensions: per-export splits, enforce mode, root route, empty/no-split modules, and
detection↔generation↔consumer consistency.

---

## 1. Architecture recap (so tests target the right seams)

Source: `src/route-chunks.ts`, `src/index.ts`, `src/manifest.ts`, `src/export-utils.ts`.

```
                         detectRouteChunksIfEnabled(cache, config, id, code)
                         ─────────────────────────────────────────────────
  guards (return noRouteChunks, NO parse):                     ── detectRouteChunks
   • config.splitRouteModules falsy                              ── hasChunkableExport ×4
   • isRootRouteModuleId(config, id)                               (getExportDependencies
   • !routeChunkExportNames.some(name => code.includes(name))       one heavy traverse)
                                                                            │
                         getRouteChunkIfEnabled(cache, config, id, chunkName, code)
                         ────────────────────────────────────────────────
   • guard: config.splitRouteModules falsy  (NOTE: no root guard — see §7)
   • getRouteChunkCode:
       'main'         → omitChunkedExports(code, allClientExports)
       clientAction…  → getChunkedExport(code, name)   (undefined if !hasChunkableExport)

  CONSUMERS
   index.ts  entry creation (L433-449)      substring source.includes(name)  ← NOT full detect
   index.ts  ?react-router-route transform  detectRouteChunksIfEnabled       filters reexports
   index.ts  ?route-chunk= transform        getRouteChunkIfEnabled           emits chunk code
   index.ts  split-exports transform        detectRouteChunksIfEnabled       rewrites module→reexports
   index.ts  ?route-chunk= + enforce        getExportNames(mainChunk)        validateRouteChunks
   manifest.ts getReactRouterManifestForDev  detectRouteChunksIfEnabled       sets *Module fields
```

Key asymmetries the tests MUST pin (these are intentional or at least load-bearing):

- **A1** Entry creation uses a cheap `source.includes(name)` substring check, so a
  non-splittable export still gets a bundler entry — but that entry resolves to an
  `preventEmptyChunkSnippet` module, and the manifest omits the `*Module` field. (§8-H1)
- **A2** `getRouteChunkIfEnabled` has no root-route guard; only `detectRouteChunksIfEnabled`
  does. (§7-E3)
- **A3** The substring guard in `detectRouteChunksIfEnabled` is a pre-filter; the parse
  is the source of truth, so a comment mentioning `clientAction` does not create a chunk. (§6-F3)

---

## 2. Verified-behavior reference table (golden values)

Fixtures below were run through the real functions. `cfg(true)` = `{splitRouteModules:true,
appDirectory:'/app', rootRouteFile:'root.tsx'}`, id `/app/routes/r.tsx`.

| Fixture                                                                                        | clientAction | clientLoader | clientMiddleware | HydrateFallback | main chunk                             | note                                          |
| ---------------------------------------------------------------------------------------------- | ------------ | ------------ | ---------------- | --------------- | -------------------------------------- | --------------------------------------------- |
| one client export `export const clientAction = async () => {}` + default                       | true         | false        | false            | false           | omits clientAction                     | splittable                                    |
| all four, each own helper + default                                                            | true         | true         | true             | true            | omits all four                         | splittable                                    |
| `const helper; export default Route(){helper()}; export const clientAction=()=>helper()`       | **false**    | false        | false            | false           | full module                            | shares top-level stmt w/ default (§4-B2)      |
| `const shared; export const clientAction=()=>shared(); export const clientLoader=()=>shared()` | false        | false        | false            | false           | full module                            | existing test; shares helper                  |
| `function make(); export const { clientAction } = make()` + default                            | **true**     | false        | false            | false           | omits clientAction                     | single-bind destructure IS chunkable (§4-B3a) |
| `function make(); export const { clientAction, foo } = make()` + default                       | **false**    | false        | false            | false           | full module                            | shared declarator w/ foo (§4-B3b)             |
| `export const clientAction; export const clientLoader` (no default)                            | true         | true         | false            | false           | **undefined**                          | empty main (§5-C3)                            |
| `import {json}; export async function action(){json()}; export default Route`                  | false        | false        | false            | false           | full module incl. import               | no client exports (§6-G2)                     |
| `// clientAction in a comment` + default                                                       | false        | false        | false            | false           | full module incl. comment              | substring false positive (§6-F3)              |
| same clientAction code, id `/app/root.tsx` (detect)                                            | false        | false        | false            | false           | —                                      | root route (§7-E1)                            |
| same clientAction code, id `/app/root.tsx` (getRouteChunkIfEnabled 'clientAction')             | —            | —            | —                | —               | generates `export const clientAction…` | root asymmetry (§7-E3)                        |

---

## 3. File layout (where each test lives)

| File                                                           | Type                         | Covers                                                                     |
| -------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------- |
| `tests/route-chunks.test.ts` (EXPAND existing)                 | unit, pure fns               | §4 detection, §5 generation, §6 disabled/empty, §7 root, §9 cache          |
| `tests/route-chunks-cache.test.ts` (NEW)                       | unit                         | §9 cache versioning + single-pass equivalence (the core regression guards) |
| `tests/manifest-split-route-modules.test.ts` (EXPAND existing) | integration                  | §8-H1/H2 manifest consumer + enforce at manifest level                     |
| `tests/route-chunk-transforms.test.ts` (NEW)                   | integration via stub Rsbuild | §8-H3/H4 bundler transforms + preventEmptyChunkSnippet                     |
| `tests/fixtures/route-chunks/` (NEW)                           | fixtures                     | shared module snippets for §4–§5                                           |

Conventions: rstest (`@rstest/core`), tests are ESM, `await` the async functions,
`setup.ts` mocks `node:fs` and provides `createStubRsbuild` (already wired). Fixtures are
plain `.tsx` strings — detection operates on code strings, not files, so inline template
literals are preferred; use `tests/fixtures/` only for the transform-integration tests that
must read real files.

---

## 4. Detection unit tests → `tests/route-chunks.test.ts` (describe "detect route chunks")

All call `detectRouteChunksIfEnabled(cache, cfg(true), '/app/routes/r.tsx', code)` with a
fresh `new Map()` cache. Assert the full `RouteChunkInfo` shape
(`hasRouteChunks`, `hasRouteChunkByExportName`, `chunkedExports`).

**D-Detect-01 — each client export is independently splittable (parametrized ×4)**
Fixture (per export `E` in `[clientAction, clientLoader, clientMiddleware, HydrateFallback]`):

```ts
export const E = async () => {}; // HydrateFallback uses: export function HydrateFallback(){return null}
export default function Route() {
  return null;
}
```

Expected: `hasRouteChunkByExportName[E]===true`, the other three `false`, `hasRouteChunks===true`,
`chunkedExports===[E]`. Covers function-decl vs const-arrow declaration forms.

**D-Detect-02 — all four splittable together**
Fixture: all four exports, each referencing its own local helper (no sharing), + default.
Expected: all four `true`, `hasRouteChunks===true`, `chunkedExports` length 4 (order =
`routeChunkExportNames` order).

**D-Detect-03 — export depends on an import**
Fixture: `import {json} from 'react-router'; export const clientLoader = async()=>json({});` + default.
Expected: `clientLoader===true` (imports do not block chunkability).

**D-Detect-04 — two client exports share a top-level helper (not chunkable)** [existing, keep]
Fixture: `const shared=()=>{}; export const clientAction=async()=>shared(); export const clientLoader=async()=>shared();`
Expected: both `false`, `hasRouteChunks===false`. (existing test asserts clientAction/clientLoader false.)

**D-Detect-05 — client export shares top-level code with the DEFAULT export (not chunkable)**
Fixture: `const helper=()=>{}; export default function Route(){return helper();} export const clientAction=async()=>helper();`
Expected: `clientAction===false`, `hasRouteChunks===false`. **(verified)** Pins that the
default export participates in the shared-statement intersection.

**D-Detect-06a — single-binding destructuring IS chunkable**
Fixture: `function make(){return{clientAction:async()=>{}}} export const{clientAction}=make();` + default.
Expected: `clientAction===true`, `chunkedExports===['clientAction']`. **(verified)**

**D-Detect-06b — multi-binding destructuring sharing a declarator is NOT chunkable**
Fixture: `function make(){return{clientAction:async()=>{},foo:1}} export const{clientAction,foo}=make();` + default.
Expected: `clientAction===false` (shares declarator with sibling export `foo`). **(verified)**

**D-Detect-07 — chunkable export isolated from a non-chunkable sibling**
Fixture: clientAction self-contained (chunkable) + clientLoader sharing a helper with default (not chunkable).
Expected: `clientAction===true`, `clientLoader===false`, `hasRouteChunks===true`,
`chunkedExports===['clientAction']`. Pins partial-split detection.

**D-Detect-08 — `chunkedExports` ordering follows `routeChunkExportNames`**
Fixture: exports in source order HydrateFallback, clientLoader, clientAction, all splittable.
Expected: `chunkedExports===['clientAction','clientLoader','HydrateFallback']` (declaration
order in source must not leak into the result order).

---

## 5. Generated-code unit tests → `tests/route-chunks.test.ts` (describe "generate route chunk code")

Call `getRouteChunkIfEnabled(cache, cfg(true), id, chunkName, code)` (or `getRouteChunkCode`
directly). Assert by re-parsing the output with `getExportNames` (from `src/export-utils`) and
checking membership — do NOT assert exact whitespace.

**G-Gen-01 — main chunk omits all chunkable client exports, keeps default + server exports**
Fixture: `import{json}from'react-router'; export async function action(){return json({})} export const clientAction=async()=>{}; export default function Route(){return null}`.
Expected (`chunkName='main'`): output exports include `default` and `action`, exclude `clientAction`.

**G-Gen-02 — individual client chunk contains only that export + its deps**
Same fixture, `chunkName='clientAction'`: output exports === `['clientAction']` only. Does
not contain `default`/`action`.

**G-Gen-03 — client chunk retains only used import specifiers**
Fixture: `import{json,useFetcher}from'react-router'; export const clientLoader=async()=>json({}); export default function Route(){return null}`.
`chunkName='clientLoader'`: output contains `import{json}` but NOT `useFetcher`.

**G-Gen-04 — main chunk is `undefined` when only client exports exist**
Fixture: `export const clientAction=async()=>{}; export const clientLoader=async()=>{};` (no default).
`chunkName='main'` → result `null`/`undefined`. **(verified)** This is the empty-main edge
that maps to `preventEmptyChunkSnippet` in the bundler.

**G-Gen-05 — non-chunkable export yields `undefined` chunk**
Fixture from D-Detect-05 (clientAction shares with default). `chunkName='clientAction'` →
`null`/`undefined` (because `!hasChunkableExport`). **(verified)**

**G-Gen-06 — main chunk for a module with NO chunkable exports returns the full module**
Fixture from §6-G2 (only `action`+default). `chunkName='main'` → full source regenerated,
exports include `default`,`action`; nothing omitted. **(verified)**

**G-Gen-07 — `getRouteChunkCode` dispatch: 'main'→omit, named→extract**
Direct unit test of `getRouteChunkCode(code,'main',…)` vs `getRouteChunkCode(code,'clientAction',…)`
asserting they route to `omitChunkedExports` / `getChunkedExport` respectively (compare outputs
against calling those paths). Pin the public dispatch contract.

**G-Gen-08 — module-id helpers round-trip**
`getRouteChunkModuleId('/app/routes/r.tsx','clientAction')` === `'/app/routes/r.tsx?route-chunk=clientAction'`;
`isRouteChunkModuleId(that)===true`; `getRouteChunkNameFromModuleId(that)==='clientAction'`;
`getRouteChunkNameFromModuleId('/app/routes/r.tsx?route-chunk=main')==='main'`;
`getRouteChunkNameFromModuleId('/app/routes/r.tsx')===null`;
`getRouteChunkNameFromModuleId('/app/routes/r.tsx?route-chunk=bogus')===null`;
`getRouteChunkEntryName('routes/clients','clientAction')==='routes/clients-client-action'`.

---

## 6. Disabled / empty / no-split tests → `tests/route-chunks.test.ts` (describe "mode + early-exit")

**F-Mode-01 — splitRouteModules falsy returns noRouteChunks without parsing**
`detectRouteChunksIfEnabled(cache, cfg(false), id, clientActionCode)` → all four `false`,
`hasRouteChunks===false`. Also `cfg(undefined)` (splitRouteModules absent). Assert no parse
side-effect is observable (e.g. malformed code does NOT throw when disabled — feed syntactically
invalid code and assert clean noRouteChunks return).

**F-Mode-02 — substring guard early-exits when no client export name appears**
`detectRouteChunksIfEnabled(cache, cfg(true), id, 'export default function Route(){return null}')`
→ all false. Asserts the fast path.

**F-Mode-03 — substring false positive does not create a chunk** **(verified)**
Code: `// clientAction mentioned in a comment only` + default. Substring guard passes (parse
runs) but `hasChunkableExport` returns false → all four `false`. Pins that the parse is the
source of truth, not the substring filter.

**G-Empty-01 — route with default only: detect no-op**
Already covered by F-Mode-02 shape; assert `hasRouteChunks===false`.

**G-Empty-02 — `getRouteChunkIfEnabled` returns null when disabled**
`cfg(false)` → `getRouteChunkIfEnabled(…,'main',clientActionCode)===null` regardless of content.

---

## 7. Root-route tests → `tests/route-chunks.test.ts` (describe "root route")

**E-Root-01 — detect returns noRouteChunks for the root route id** [existing, keep]
`detectRouteChunksIfEnabled(cache, cfg(true), '/app/root.tsx', clientActionCode)` → all false.

**E-Root-02 — root detection is path-normalized (query strings, relative segments)**
Assert `isRootRouteModuleId` equivalence via detect on ids:

- `/app/root.tsx` ✓ root
- `/app/./root.tsx` ✓ root (normalize)
- `/app/root.tsx?react-router-route` ✓ root (query stripped by `normalizeRelativeFilePath`)
- `/app/routes/root.tsx` ✗ not root
- windows-style or trailing slashes per `pathe.normalize` behavior — document expected.

**E-Root-03 — `getRouteChunkIfEnabled` has NO root guard (asymmetry pin)** **(verified)**
`getRouteChunkIfEnabled(cache, cfg(true), '/app/root.tsx','clientAction', clientActionCode)`
returns the generated `export const clientAction…` — NOT null. This is the intentional
asymmetry: detection gates root, generation does not. Test pins current behavior so the
precompute refactor preserves it (callers only request root chunks they never created).

**E-Root-04 — validateRouteChunks is a no-op for root route**
`validateRouteChunks({config:cfg('enforce'), id:'/app/root.tsx', valid:{clientAction:false,…}})`
does NOT throw. Pins the `isRootRouteModuleId` early return in `validateRouteChunks`.

---

## 8. Enforce + consumer-consistency tests

### 8a. Enforce unit → `tests/route-chunks.test.ts` (describe "enforce mode")

`validateRouteChunks` throws iff any `valid[name]===false` for a non-root route, regardless
of caller. Enforce vs. plain-`true` gating happens at the call sites (manifest/index).

**V-Enforce-01 — all valid → no throw**
`validateRouteChunks({config:cfg('enforce'), id:'/app/routes/r.tsx', valid:{clientAction:true,clientLoader:true,clientMiddleware:true,HydrateFallback:true}})` returns silently.

**V-Enforce-02 — one invalid → throws naming the export** [existing, keep/extend]
valid has clientAction:false only. Assert `throwError(/Error splitting route module/)` AND the
message contains `clientAction` and the singular guidance phrasing ("This export…its own chunk…shares").

**V-Enforce-03 — multiple invalid → throws plural message listing all**
valid: clientAction:false, clientLoader:false. Assert message lists both and uses plural
phrasing ("These exports…their own chunks…they share"). Pins the `plural` branch.

**V-Enforce-04 — enforce skipped for root** (cross-ref E-Root-04)

### 8b. Manifest consumer → `tests/manifest-split-route-modules.test.ts` (EXPAND)

Use the existing `createTempApp()` helper (writes `app/root.tsx` + a route file). Build a
`clientStats.assetsByChunkName` map.

**M-Manifest-01 — clientActionModule set when splittable** [existing, keep]
Route exports self-contained clientAction → `manifest.routes[…].clientActionModule` points to
the `…-client-action.js` asset. Repeat the shape for clientLoaderModule, clientMiddlewareModule,
hydrateFallbackModule (parametrized).

**M-Manifest-02 — \*Module fields omitted in dev** [existing, keep]
`isBuild:false` → all four `*Module` fields undefined even when exports present.

**M-Manifest-03 — \*Module field omitted when export is NOT splittable** **(H1 critical)**
Route file where clientAction shares a top-level helper with default (D-Detect-05 fixture).
Build mode. Expected: `hasClientAction===true` (export exists) BUT
`clientActionModule===undefined` (not splittable, so `hasRouteChunkByExportName.clientAction===false`).
Pins the entry/manifest asymmetry: a bundler entry may still be created (substring), but the
manifest must not advertise a module that was not split.

**M-Manifest-04 — enforce throws at manifest level for unsplittable export**
`splitRouteModules:'enforce'`, build mode, route with clientAction sharing code (D-Detect-05).
Expected: `getReactRouterManifestForDev` rejects / `validateRouteChunks` throws inside it.
Assert the throw propagates (wrap call in `expect(…).rejects.toThrow(/Error splitting route module/)`).

**M-Manifest-05 — plain `true` (non-enforce) does NOT throw for unsplittable**
Same route as M-Manifest-04 but `splitRouteModules:true`. Expected: manifest resolves without
throwing; `clientActionModule===undefined`, `hasClientAction===true`. Pins that enforce gating
is at the call site, not in detect.

**M-Manifest-06 — root route: no \*Module fields even with client exports**
Root route file exports clientAction. Build + split. Expected: all `*Module` undefined on the
root entry (detect returned noRouteChunks for root).

### 8c. Bundler-transform consumer → `tests/route-chunk-transforms.test.ts` (NEW)

These exercise the three `api.transform` hooks in `src/index.ts`. Use `createStubRsbuild`
(from `setup.ts`) to drive `reactRouter()` setup, then assert on the `transform` spy calls or
on `processAssets` output. **Mark these `it.skip` with a TODO if the stub harness cannot yet
isolate a single transform invocation** — they are the highest-value but hardest tests.

**T-Transform-01 — split-exports rewrites a chunkable route module to reexport stubs (H3)**
Route with splittable clientAction + default. Assert the generated module code is:

```
export { default } from "./r.tsx?route-chunk=main";
export { clientAction } from "./r.tsx?route-chunk=clientAction";
```

(non-chunked names go to `main`; each `chunkedExports` name gets its own reexport line.)

**T-Transform-02 — non-chunkable route module is passed through unchanged (H3)**
Route with only `action`+default (no client exports): split-exports transform returns original
code (`hasRouteChunks===false` no-op branch).

**T-Transform-03 — `?route-chunk=` returns generated chunk or preventEmptyChunkSnippet (G3)**
For a splittable clientAction module id `…?route-chunk=clientAction`: transform returns the
generated chunk code. For a disabled/non-build config: returns
`Math.random()<0&&console.log("…");`. For a non-chunkable export: chunk is null → snippet.

**T-Transform-04 — enforce validates the generated MAIN chunk (H4)**
Enforce + splittable route: main chunk generated → `getExportNames(main)` excludes client
exports → `validateRouteChunks` passes. Inject a fixture where main would still contain a
client export (regression sim) and assert the transform throws. Pins the generate→validate loop.

**T-Transform-05 — entry map created per substring, not per detect (H1)**
Build + split, route whose clientAction shares code (non-splittable). Assert
`webRouteEntries` contains a `routes/r-client-action` entry (substring match created it) even
though detection says not-splittable. (Assert via unwrapConfig or a spy on the entries object.)

---

## 9. Cache + single-pass equivalence tests → `tests/route-chunks-cache.test.ts` (NEW)

These are the **most important regression guards for the precompute refactor.** They prove a
single-pass precomputed analysis produces identical results to today's per-call cache.

**C-Cache-01 — version invalidation on content change**
cacheKey = `/app/routes/r.tsx`. Call `detectRouteChunksIfEnabled` with code A (clientAction
chunkable), then with code B (clientAction non-chunkable, e.g. shares helper). Same cache
instance, same cacheKey. Assert B's result reflects B, not a stale A. Pins that `version===code`
keys actually invalidate.

**C-Cache-02 — same code + cacheKey returns cached result (no recompute)**
Spy/stub `parse` (or count via a module-level counter in a throwaway double) and assert that a
second `detectRouteChunksIfEnabled` with identical code does not re-parse. Pins the cache hit path.

**C-Cache-03 — structuredClone isolation: mutating a returned AST does not corrupt the cache**
This guards `codeToAst`'s `structuredClone`. Call `getExportDependencies` (or any path that
returns derived data), then call again with the same code; assert the second result equals the
first byte-for-byte even if test code mutated the first return's structures. (If the public API
does not expose AST, frame as: two sequential identical calls return deeply-equal results and
the second is served from cache.)

**C-Cache-04 — single-pass equivalence: detect + all chunks == per-export calls** ★
The headline test. For a fixture with all four client exports splittable + shared-code
siblings, compute via the CURRENT per-export API:

- `info = detectRouteChunksIfEnabled(…)`
- `main = getRouteChunkIfEnabled(…,'main',…)`
- for each name: `chunk[name] = getRouteChunkIfEnabled(…, name, …)`
  Then (after the refactor) compute via the NEW precompute API (e.g. a hypothetical
  `analyzeRouteChunks(code, config, id)` returning `{info, chunks: Record<RouteChunkName,string>}`)
  and assert `info`, `main`, and every `chunk[name]` are identical. Until the new API exists,
  write this test against the current API as the **reference oracle** and mark the new-API half
  `it.skip('TODO: re-enable when precompute API lands')`.

**C-Cache-05 — undefined cache (no Map) still computes correct results**
Pass `undefined` as cache to all functions; `getOrSetFromCache` short-circuits to `getValue()`.
Assert results identical to the cached path (C-Cache-04 oracle). Pins the no-cache fallback.

**C-Cache-06 — cache is shared across index + manifest callers (H2)** ★
Simulate the real wiring: one `routeChunkCache` Map is passed to both the manifest path
(`getReactRouterManifestForDev(…, {cache}`) and the index transform path. For the same route
module, assert both derive the same `hasRouteChunkByExportName`. This is the consistency
property the precompute must guarantee — a single analysis object feeding both consumers.

---

## 10. Coverage matrix

| Task-body dimension           | Tests                                                   |
| ----------------------------- | ------------------------------------------------------- |
| split: clientAction           | D-Detect-01, D-02, D-03, D-04, D-05, D-07, G-Gen-01..07 |
| split: clientLoader           | (same set, parametrized)                                |
| split: clientMiddleware       | (same set, parametrized)                                |
| split: HydrateFallback        | (same set, parametrized; function-decl form)            |
| enforce enabled               | V-Enforce-01..04, M-Manifest-04                         |
| enforce disabled (plain true) | M-Manifest-05                                           |
| enforce error behavior        | V-Enforce-02, V-Enforce-03, M-Manifest-04               |
| root route                    | E-Root-01..04, M-Manifest-06                            |
| no split exports              | G-Gen-06, F-Mode-02, T-Transform-02                     |
| empty chunks                  | G-Gen-04, G-Gen-05, T-Transform-03                      |
| detection ↔ generated code    | G-Gen-01..07, T-Transform-01, T-Transform-04            |
| consumed by index caller      | T-Transform-01..05                                      |
| consumed by manifest caller   | M-Manifest-01..06                                       |
| precompute equivalence        | C-Cache-01..06 (esp. C-Cache-04, C-Cache-06)            |

---

## 11. Implementation notes for the implementer

1. **Order:** write §4–§7 first (pure units, fast, no harness). They validate the golden
   table in §2. Then §9 (cache) — the regression backbone. Then §8b (manifest, uses
   `createTempApp`). Leave §8c (transforms) for last; if the stub harness can't isolate a
   transform, ship them as `it.skip` with the assertion encoded in a comment.
2. **Assertions on generated code:** always re-parse with `getExportNames` and assert on
   export membership / import specifier presence — never on `generate()` whitespace.
3. **The substring guard (F-Mode-03) and root asymmetry (E-Root-03) are deliberate load-bearing
   behaviors, not bugs.** Tests pin them so the precompute doesn't "fix" them and break callers.
4. **C-Cache-04 is the single most valuable test** — it is the equivalence oracle. Build the
   precompute against it.
5. **H1 (M-Manifest-03, T-Transform-05)** documents that bundler entries and manifest fields
   can disagree for non-splittable exports. The precompute must preserve this disagreement
   exactly (entry created via substring; module field absent via detect).
6. rstest config (`rstest.config.ts`) already includes `tests/**/*.test.ts` and loads
   `tests/setup.ts`; new test files are picked up with no config change.
