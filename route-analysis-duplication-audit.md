# Route Analysis Duplication Audit

Branch: `perf/bundling-performance` @ `c2452de`
Scope: every place a **route module file** is read from disk, parsed/transformed,
or mined for exports/metadata across the dev + build pipeline.
Companion to `route-chunk-parse-traverse-analysis.md` (which covers
`src/route-chunks.ts` internals in depth).

---

## 1. Method & scope

Cross-referenced four target files plus their shared helpers:

| File                             | Role                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/export-utils.ts`            | The only module that reads route files from disk; owns the transform + export-extraction caches.       |
| `src/route-chunks.ts`            | Babel parse/traverse/generate for route-chunk splitting (see companion doc).                           |
| `src/manifest.ts`                | `getReactRouterManifestForDev` — per-route export analysis + chunk-metadata mapping.                   |
| `src/modify-browser-manifest.ts` | Rspack `emit` hook that (re)runs manifest generation + computes SRI over **built assets**.             |
| `src/build-manifest.ts`          | Server-bundle routing. **Does NOT read route files** — only path/id strings.                           |
| `src/index.ts`                   | Bundler `api.transform` hooks (the in-memory code path) + prerender validation + SRI/manifest staging. |

Two fundamentally different code sources feed the same analysis primitives:

- **Pipeline A — disk-read path** (`getRouteModuleAnalysis`): `stat → readFile(path) → transformToEsm(source) → getExportNames(code)`. Used by manifest generation and prerender validation.
- **Pipeline B — bundler-transform path** (`api.transform` hooks): receives `args.code` from the bundler (in-memory), calls `transformToEsm(args.code)` + `getExportNames(code)` + `detectRouteChunksIfEnabled`/`getRouteChunkIfEnabled` directly.

---

## 2. Cache layers (the deduplication substrate)

There are **four** independent caches. Understanding them is prerequisite to judging
what is actually duplicated vs. already-shared.

### 2a. `export-utils.ts` — module-level, process-wide, shared across A and B

| Cache                      | Location                | Key                               | Version / invalidation                         | Bound        |
| -------------------------- | ----------------------- | --------------------------------- | ---------------------------------------------- | ------------ |
| `transformCache`           | `export-utils.ts:24`    | `resourcePath`                    | input `code` string (`cached.source === code`) | 2048 (`:30`) |
| `exportNamesCache`         | `export-utils.ts:25`    | `code` string (content-addressed) | n/a (key IS the content)                       | 2048         |
| `routeModuleAnalysisCache` | `export-utils.ts:26-29` | `resourcePath`                    | `mtimeMs` + `size` from `stat()`               | 2048         |

`routeModuleAnalysisCache` wraps `transformToEsm` + `getExportNames` + the raw
`readFile`/`source`. It is the **only** consumer that pays `stat()` + `readFile()`.
The bundler path (Pipeline B) bypasses it entirely and hits `transformCache` +
`exportNamesCache` directly.

### 2b. `route-chunks.ts` — per-build, passed by reference (`routeChunkCache`)

Declared once per plugin invocation at `index.ts:403`
(`const routeChunkCache: RouteChunkCache = new Map()`), threaded into
`routeChunkOptions.cache` (`index.ts:408`) and every `*IfEnabled` call.
Keyed by `normalizeRelativeFilePath(id)` (`route-chunks.ts:826`, query string
stripped) + sub-key discriminator; versioned by the exact `code` string.
See companion doc §2/§5 for the full sub-key table.

**Cross-cache consequence:** Pipeline A and Pipeline B share the _lower_ caches
(`transformCache`, `exportNamesCache`) but Pipeline A additionally owns
`routeModuleAnalysisCache`. For a route-chunk cache _hit_ to occur across the two
pipelines, the `code` they feed to `detectRouteChunksIfEnabled` must be byte-identical
(see §6, finding F-3).

---

## 3. Per-code-path inventory: route-file → operations → call-sites

Notation: R = read from disk, T = esbuild transform, L = lexer export extract,
B = Babel parse/traverse/generate (route-chunks), X = other extract.

### 3a. Manifest generation — `getReactRouterManifestForDev` (`manifest.ts:110`)

Per route, inside `Promise.all` over `routes` (`manifest.ts:163`):

| Step                         | Line       | Op                        | Primitive                                            |
| ---------------------------- | ---------- | ------------------------- | ---------------------------------------------------- |
| resolve route file path      | `:170`     | —                         | `resolve(context, route.file)`                       |
| read + transform + extract   | `:190`     | R, T, L                   | `getRouteModuleAnalysis(routeFilePath)`              |
| dev CSS fallback             | `:191-199` | X (regex on raw `source`) | `/\.css.../ .test(source)`                           |
| chunk detection (build only) | `:204`     | B                         | `detectRouteChunksIfEnabled(cache, cfg, path, code)` |
| chunk module-path mapping    | `:249-272` | —                         | `getModulePathForChunk(getRouteChunkEntryName(...))` |

**Needs from the file:** `source` (raw, for dev CSS regex), `code` (transformed,
for chunk detection), `exports` (full list → `hasAction`/`hasLoader`/`hasClient*`/
`hasDefault`/`hasErrorBoundary` booleans), and chunk booleans → asset paths.

Called from **3** sites (each iterates ALL routes):

- `index.ts:869` — prerender block (`if (isPrenderEnabled)`)
- `index.ts:1352` — virtual server-manifest transform fallback (when `latestServerManifest` is null)
- `modify-browser-manifest.ts:39` — Rspack `emit` hook (web compilation)

### 3b. Prerender export validation — `validateSsrFalsePrerenderExports` (`index.ts:733`)

| Step               | Line   | Op      | Primitive                                                    |
| ------------------ | ------ | ------- | ------------------------------------------------------------ |
| read route exports | `:761` | R, T, L | `getRouteModuleExports(filePath)` → `getRouteModuleAnalysis` |

**Needs:** the **full export-name list** per route (`exports.includes('headers'|'action'|'loader')`,
`index.ts:769-782`). This runs _inside_ the prerender flow that already called
`getReactRouterManifestForDev` at `:869` — so the same route files are analyzed
twice in one prerender pass (second call is a `routeModuleAnalysisCache` hit, but
still pays `stat()` per route).

### 3c. Client-entry transform — `?__react-router-build-client-route` (`index.ts:1367`)

| Step                              | Line    | Op  | Primitive                                                                   |
| --------------------------------- | ------- | --- | --------------------------------------------------------------------------- |
| transform                         | `:1377` | T   | `transformToEsm(args.code, args.resourcePath)`                              |
| export extract                    | `:1378` | L   | `getExportNames(code)`                                                      |
| chunk detection (build, web only) | `:1383` | B   | `detectRouteChunksIfEnabled(routeChunkCache, cfg, args.resourcePath, code)` |

**Needs:** export names to filter `CLIENT_ROUTE_EXPORTS`/`SERVER_ONLY_ROUTE_EXPORTS`
reexports (`:1392-1403`); `chunkedExports` to drop chunked names from reexports.

### 3d. Route-chunk transform — `?route-chunk=` (`index.ts:1414`)

| Step                            | Line    | Op  | Primitive                                                                                 |
| ------------------------------- | ------- | --- | ----------------------------------------------------------------------------------------- |
| transform                       | `:1442` | T   | `transformToEsm(args.code, args.resourcePath)`                                            |
| chunk generate                  | `:1446` | B   | `getRouteChunkIfEnabled(routeChunkCache, cfg, args.resourcePath, chunkName, transformed)` |
| enforce validation (main chunk) | `:1455` | L   | `getExportNames(chunk)` — over **generated** chunk code                                   |

**Needs:** the generated chunk body (`chunk`) to emit as module source; export names
of the _generated_ main chunk to validate enforce-split invariants (`:1454-1466`).
Fires once per chunk (main + N named) per route module.

### 3e. Split-exports transform — `test /\.[cm]?[jt]sx?$/` (`index.ts:1476`)

| Step            | Line    | Op  | Primitive                                      |
| --------------- | ------- | --- | ---------------------------------------------- |
| transform       | `:1504` | T   | `transformToEsm(args.code, args.resourcePath)` |
| chunk detection | `:1509` | B   | `detectRouteChunksIfEnabled(...)`              |
| export extract  | `:1519` | L   | `getExportNames(transformed)`                  |

**Needs:** `hasRouteChunks` + `chunkedExports` to decide whether to rewrite the module
into reexports (`:1515-1547`); full export list to split main vs. chunked reexports.

### 3f. `.client` stub transform — `test /\.client/` (`index.ts:1574`, node env only)

| Step                        | Line    | Op      | Primitive                                                                           |
| --------------------------- | ------- | ------- | ----------------------------------------------------------------------------------- |
| transform                   | `:1588` | T       | `transformToEsm(args.code, args.resourcePath)`                                      |
| export + export-all extract | `:1590` | L       | `getExportNamesAndExportAll(code)`                                                  |
| recursive re-export walk    | `:1677` | R, T, L | `readFile` + `transformToEsm` + `getExportNamesAndExportAll` per re-exported module |

**Scope note:** operates on `.client` modules, **not route modules**. Included for
completeness because it is the only other place that does `readFile` +
`transformToEsm` + export extraction. The recursive `readFile` walk (`:1670-1699`)
is unique to this path and re-reads arbitrary dependency files.

### 3g. SRI computation — `createModifyBrowserManifestPlugin` (`modify-browser-manifest.ts:103-124`)

| Step                 | Line       | Op                                            |
| -------------------- | ---------- | --------------------------------------------- |
| hash built JS assets | `:116-122` | `createHash('sha384').update(asset.source())` |

**Scope note:** reads **built bundle assets** (`compilation.assets`), NOT route source
files. Not a route-analysis duplication. The `onManifest(manifest, sri)` staging
callback (`index.ts:1262-1295`) just attaches `sri` to the already-computed manifest
and shards it per server bundle — no file reads.

### 3h. `build-manifest.ts` — `getBuildManifest` (`:60`) / `getRoutesByServerBundleId` (`:149`)

**No route-file reads, transforms, or export extraction.** Pure path/id manipulation:
resolves `route.file` (`:89`, `:112`), normalizes to root-relative (`:92`), and calls
the user-supplied `serverBundles({ branch })` function (`:108`). Routes are carried as
string metadata only. Listed here to **exclude** it from the duplication set.

---

## 4. Route-file → operations → call-sites (consolidated table)

For a single route module `R.tsx` with main + 2 chunkable exports, one production
build (splitRouteModules enabled, prerender enabled), the operations on `R.tsx`:

| #   | Call-site (file:line)                       | Pipeline | R   | T   | L   | B-parse | B-traverse | B-generate | What it needs                            |
| --- | ------------------------------------------- | -------- | --- | --- | --- | ------- | ---------- | ---------- | ---------------------------------------- |
| 1   | `manifest.ts:190` (manifest gen ×3 callers) | A        | ✓   | ✓   | ✓   | —       | —          | —          | source (CSS), code, exports, chunk bools |
| 2   | `index.ts:761` (prerender validation)       | A        | ✓\* | ✓\* | ✓\* | —       | —          | —          | full export list                         |
| 3   | `index.ts:1504` split-exports transform     | B        | —   | ✓   | —   | ✓       | ✓          | —          | hasRouteChunks, chunkedExports, exports  |
| 4   | `index.ts:1377` client-entry transform      | B        | —   | ✓   | ✓   | ✓       | ✓          | —          | chunkedExports, exports                  |
| 5   | `index.ts:1442` route-chunk `main`          | B        | —   | ✓   | —   | ✓       | ✓          | ✓          | generated main chunk body                |
| 6   | `index.ts:1442` route-chunk `clientAction`  | B        | —   | ✓   | —   | ✓       | —          | ✓          | generated named chunk body               |
| 7   | `index.ts:1442` route-chunk `clientLoader`  | B        | —   | ✓   | —   | ✓       | —          | ✓          | generated named chunk body               |

`*` = served from `routeModuleAnalysisCache` (mtime+size hit) — no actual `readFile`,
but `stat()` still runs.

**Effective cost per cold route module (main + 2 chunks), thanks to caching:**

- `readFile`: 1× (Pipeline A, cached thereafter)
- esbuild `transform`: 1× (`transformCache`, path+source keyed — shared across A & B
  **iff** disk source === bundler `args.code`)
- lexer export extract: 1× (`exportNamesCache`, content-keyed)
- Babel `parse`: 1× (route-chunks `codeToAst`)
- Babel `traverse`: 1× (`getExportDependencies`)
- Babel `generate`: 3× (one per chunk — inherently per-chunk, see companion doc §4)
- `structuredClone`: 4× (companion doc §3a/§4 — the known redundant hot spot)

---

## 5. Duplication findings

Each finding: what is duplicated, the consumers, and whether it is safe to
consolidate or genuinely diverges.

### F-1 — Export-name list extracted redundantly; manifest keeps only booleans

**Sites:** `manifest.ts:190` (→ booleans), `index.ts:761` (→ full list), `index.ts:1378`,
`index.ts:1519`, `index.ts:1455` (generated chunk).
**Duplication:** the full export-name set for a route is computed by
`getExportNames`/`getRouteModuleAnalysis` in 4 separate call-sites for the _same_
module source. The `exportNamesCache` (content-keyed) makes the lexer parse itself
run once, but each site issues the async call and pays a `Map` lookup.
**Divergence:** `manifest.ts` **discards** the list, storing only
`hasAction`/`hasLoader`/`hasClient*`/`hasDefault`/`hasErrorBoundary` booleans
(`manifest.ts:216-279`). The prerender validator (`index.ts:769-782`) needs names the
manifest does not carry (`headers`, raw `loader`), forcing a **second full pass** over
all route files (`index.ts:758-762`) that runs right after manifest generation
(`index.ts:869`).
**Consolidation:** SAFE to thread the full export-name list (or the `RouteModuleAnalysis`)
out of `getReactRouterManifestForDev` so `validateSsrFalsePrerenderExports` reuses it
instead of re-calling `getRouteModuleExports`. Eliminates the `:758-762` pass entirely.

### F-2 — Manifest generation runs up to 3× per build, each iterating all routes

**Sites:** `index.ts:869` (prerender), `index.ts:1352` (server-manifest transform
fallback), `modify-browser-manifest.ts:39` (emit hook).
**Duplication:** each invocation iterates `Object.entries(routes)` and calls
`getRouteModuleAnalysis` per route (`manifest.ts:163-190`). `routeModuleAnalysisCache`
(mtime+size keyed) absorbs the redundant `readFile`/`transform`/`extract` on the 2nd
and 3rd runs, but every route still pays `stat()` (`export-utils.ts:133`) per call, and
the whole `Promise.all` + chunk-detection + jsesc serialization repeats.
**Consolidation:** PARTIALLY SAFE. The emit-hook result (`modify-browser-manifest.ts:39`)
is already staged into `latestServerManifest` via `onManifest` (`index.ts:1262-1295`).
The server-manifest transform (`index.ts:1352`) already prefers that staged value and
only falls back to re-generation when it is absent. The prerender call (`index.ts:869`)
runs in `onAfterBuild` **before** the web `emit` hook has necessarily staged the
manifest, so it currently cannot reuse it. Ordering the prerender validation after the
manifest is staged (or capturing the manifest once and passing it down) would remove
one full generation. Investigate build-phase ordering before changing.

### F-3 — Two code sources for the same route file (disk vs bundler)

**Sites:** Pipeline A feeds `code = readFile(path)` (`export-utils.ts:140`);
Pipeline B feeds `code = args.code` (bundler-supplied, e.g. `index.ts:1377,1442,1504`).
**Duplication:** `transformToEsm` is invoked from both pipelines for the same path.
The `transformCache` is keyed by `resourcePath` and versioned by the input `code`
string (`export-utils.ts:56-59`), so:

- if `args.code === diskSource` → cache **hit**, esbuild runs once (good);
- if they differ (preceding loader normalization, source-map injection, line-ending
  changes) → cache **miss** that **overwrites** the entry, and the route-chunks cache
  (versioned by `code`, `route-chunks.ts`) silently re-parses/re-traverses.
  **Divergence:** correctness-relevant, not just performance. The equality of the two
  code strings is **assumed, never asserted** (companion doc §5). Pipeline A also needs
  the **raw `source`** for the dev CSS fallback (`manifest.ts:191-199`), which Pipeline B
  does not have and does not replicate.
  **Consolidation:** DO NOT collapse blindly. Safe hardening: have Pipeline A accept the
  already-transformed `code` from the bundler when available (avoiding the separate
  disk read), and make the code-source contract explicit. The raw-`source` dependency
  (dev CSS regex) must be preserved or replaced with a transformed-code check.

### F-4 — Dev CSS fallback uses raw source; nothing else does

**Site:** `manifest.ts:191-199`.
**What it needs:** the **raw `source`** string to regex-test for `.css/.less/.sass/.scss`
import literals and synthesize a fallback asset path in dev (when `cssAssets` is empty).
**Divergence:** this is the **only** consumer of `RouteModuleAnalysis.source`. Every
other consumer uses `code` or `exports`. If Pipeline A were rewritten to skip the disk
read (F-3), this fallback would lose its input unless the CSS check is moved onto the
transformed `code` (esbuild preserves `import './x.css'` statements in ESM output, so a
transformed-code regex would work and remove the raw-source dependency entirely).
**Consolidation:** SAFE to migrate the regex onto `code` (transformed ESM), which then
unblocks dropping the raw `source` from the analysis shape.

### F-5 — `transformToEsm` called in every transform hook (deduped, but noisy)

**Sites:** `index.ts:1377, 1442, 1504, 1588`.
**Duplication:** each of the 4 transform hooks independently calls
`transformToEsm(args.code, args.resourcePath)`. All hit the same `transformCache`
(path+source keyed), so esbuild runs at most once per unique source per path. Not a
runtime duplicate, but a **call-site** duplicate: 4 places to maintain the same
"transform then analyze" prelude.
**Consolidation:** SAFE (refactor-only, no behavior change) to extract a shared
"analyze route module from bundler args" helper returning `{code, exports,
chunkInfo}`. Low priority — purely structural.

### F-6 — `detectRouteChunksIfEnabled` called from 3 sites (fully deduped)

**Sites:** `manifest.ts:204`, `index.ts:1383`, `index.ts:1509`.
**Duplication:** none at runtime — `routeChunkCache` (path+code keyed) makes the first
call cold and the rest warm (companion doc §4, sites #2/#3 are cheap warm reads).
**Consolidation:** NOT NEEDED. Already optimal; documented for completeness.

### F-7 — `.client` stub transform re-reads dependency modules from disk

**Site:** `index.ts:1670-1699` (recursive `collectExportNamesFromModule`).
**Duplication:** `readFile` + `transformToEsm` + `getExportNamesAndExportAll` per
re-exported module. The top-level `.client` module's transform/extract are deduped by
`transformCache`/`exportNamesCache`, but the **recursive walk** over `export *`
targets (`:1677`) reads each dependency fresh with no `routeModuleAnalysisCache`-style
mtime cache — every build re-stats and re-reads every transitively re-exported file.
**Scope:** `.client` modules, not route modules. **Consolidation:** SAFE (orthogonal
optimization) to add an mtime+size cache mirroring `routeModuleAnalysisCache` for the
recursive walk, or to reuse `getRouteModuleAnalysis` for the leaf reads. Separate from
the route-file duplication set but the highest-uncached I/O in the neighborhood.

---

## 6. Summary: safe-to-consolidate vs. diverges

| Finding                                        | Duplicate?             | Safe to consolidate?                                                                     | Notes                                   |
| ---------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| F-1 export list (manifest keeps booleans only) | Yes (call)             | **YES** — thread the list/analysis out of manifest gen to prerender validator            | Removes the `index.ts:758-762` pass     |
| F-2 manifest gen ×3                            | Yes (stat + serialize) | **PARTIAL** — depends on build-phase ordering; emit hook already staged via `onManifest` | Prerender call (`:869`) is the hard one |
| F-3 dual code source (disk vs bundler)         | Conditional            | **NO (blindly)** — make the contract explicit; raw-source dependency (F-4) blocks it     | Correctness risk: silent cache misses   |
| F-4 dev CSS fallback on raw `source`           | Diverges               | **YES** — move regex onto transformed `code`                                             | Unblocks F-3                            |
| F-5 `transformToEsm` in 4 hooks                | Call-site only         | **YES** (refactor) — structural, no perf gain                                            | Low priority                            |
| F-6 `detectRouteChunksIfEnabled` ×3            | No (cached)            | **NO** — already optimal                                                                 | —                                       |
| F-7 `.client` recursive re-reads               | Yes (no mtime cache)   | **YES** — orthogonal; add mtime cache or reuse `getRouteModuleAnalysis`                  | Not route files                         |

**Recommended consolidation order** (each unblocks the next):

1. **F-4** — migrate the dev CSS regex from raw `source` to transformed `code`. Removes
   the only consumer of `RouteModuleAnalysis.source`.
2. **F-1** — expose the full export list from `getReactRouterManifestForDev` (or return
   the per-route `RouteModuleAnalysis`) so prerender validation reuses it. Deletes the
   `index.ts:758-762` re-extraction pass.
3. **F-3** — with F-4 done, Pipeline A can accept transformed `code` from the bundler
   and drop the separate disk read, making the route-chunks cache version match
   deterministically. Assert `args.code === diskSource` in dev as a guard.
4. **F-2** — investigate whether the prerender manifest call (`index.ts:869`) can reuse
   the staged `latestServerManifest` instead of regenerating; requires confirming
   `onAfterBuild`/`emit` ordering.
5. **F-7** (orthogonal) — add an mtime cache to the `.client` recursive walk.

---

## 7. Correctness caveats (must-preserve invariants)

1. **Raw `source` is load-bearing for dev CSS fallback** (`manifest.ts:191-199`).
   Any consolidation that drops the disk read must relocate this check (F-4) or
   preserve access to the raw source.
2. **Code-source equality is assumed, not enforced** (companion doc §5). Pipeline A's
   `code` and Pipeline B's `args.code` must agree for the route-chunks cache to hit
   across pipelines; a divergence silently re-parses rather than erroring.
3. **`structuredClone` in `codeToAst` is a correctness guard**, not a redundant cost —
   each chunk consumer mutates `ast.program.body` in place (companion doc §6.1).
4. **Manifest stores booleans, not export lists** (`manifest.ts:216-279`). Downstream
   consumers needing raw names (`headers`, raw `loader`) currently re-extract (F-1);
   do not assume the manifest carries the full list.
5. **`getBuildManifest` and SRI do not touch route source files** (§3g/§3h) — they
   operate on path/id metadata and built assets respectively. Excluded from the
   duplication set.
