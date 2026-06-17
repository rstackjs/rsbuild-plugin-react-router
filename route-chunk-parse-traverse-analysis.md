# Route Chunk Parse / Traverse / Generate Behavior — Current State

Branch: `perf/bundling-performance` @ `c2452de`
Scope: `src/route-chunks.ts` + callers in `src/index.ts` and `src/manifest.ts`

---

## 1. Public entry points and their dispatch

All three public functions funnel into a layered set of private helpers, each
of which is memoized through `getOrSetFromCache`. The `*IfEnabled` wrappers are
the only entry points called from outside the module.

| Public fn (src/route-chunks.ts)                              | Line | Delegates to                                             | Cache key prefix                |
| ------------------------------------------------------------ | ---- | -------------------------------------------------------- | ------------------------------- |
| `detectRouteChunksIfEnabled(cache, config, id, code)`        | 834  | `detectRouteChunks`                                      | `normalizeRelativeFilePath(id)` |
| `getRouteChunkIfEnabled(cache, config, id, chunkName, code)` | 870  | `getRouteChunkCode`                                      | `normalizeRelativeFilePath(id)` |
| `getRouteChunkCode(code, chunkName, cache, cacheKey)`        | 782  | `omitChunkedExports` (main) / `getChunkedExport` (named) | per-call                        |

Both `*IfEnabled` wrappers compute `cacheKey = normalizeRelativeFilePath(id, config.appDirectory)`
(`relative` → `normalize` → `.split('?')[0]`), so **query strings are stripped**
before keying. A module reached as `foo.tsx`, `foo.tsx?route-chunk=main`, or
`foo.tsx?__react-router-build-client-route` all collide onto the **same cache key**.

---

## 2. Cache structure and versioning

```ts
type RouteChunkCacheEntry<T> = { value: T; version: string };
type RouteChunkCache = Map<string, RouteChunkCacheEntry<unknown>>;
```

`getOrSetFromCache(cache, key, version, getValue)` (line 69):

- **Hit** only when an entry exists for `key` **and** `entry.version === version`.
- The `version` argument is **always the `code` string itself** at every call site.
- Therefore: cache reuse is keyed by `(normalized file path, full source code)`.
  A different `code` string for the same path = full recompute.

There is exactly **one** cache instance for the whole build:
`const routeChunkCache: RouteChunkCache = new Map();` (index.ts:403),
created once per plugin invocation and passed by reference to every consumer —
the manifest path (`routeChunkOptions.cache` → manifest.ts:205) and all three
Rspack transform hooks share it.

---

## 3. Each parse / traverse / generate site

### 3a. `codeToAst` — parse + clone (lines 87-95)

```ts
const codeToAst = (code, cache, cacheKey) => {
  return structuredClone(
    getOrSetFromCache(cache, `${cacheKey}::codeToAst`, code, () =>
      parse(code, { sourceType: 'module' })
    )
  );
};
```

- **Parse** (`babel.parse`) runs only on a cache MISS — once per `(path, code)`.
- **`structuredClone` runs UNCONDITIONALLY on every call**, cache hit or miss.
  This is the dominant redundant cost: a deep clone of the entire AST File
  node happens every time `codeToAst` is invoked, even when the parse itself
  was served from cache.
- Rationale for the clone: every consumer **mutates** `ast.program.body` in
  place (filter + map + assign), so sharing one AST node would corrupt later
  reads. The clone is a correctness guard, not an optimization.

`codeToAst` is called from exactly three sites, each inside a
`getOrSetFromCache` miss-callback (so each fires at most once per distinct key
per build):

| Caller                  | Line | Cache key                                     | What it does with the AST               |
| ----------------------- | ---- | --------------------------------------------- | --------------------------------------- |
| `getExportDependencies` | 170  | `${ck}::getExportDependencies`                | `traverse(ast, { ExportDeclaration })`  |
| `getChunkedExport`      | 547  | `${ck}::getChunkedExport::${name}::{opts}`    | filter `ast.program.body`, `generate()` |
| `omitChunkedExports`    | 663  | `${ck}::omitChunkedExports::${names}::{opts}` | filter `ast.program.body`, `generate()` |

### 3b. `getExportDependencies` — traverse (lines 158-315)

- Cached at `${ck}::getExportDependencies`, version = `code`.
- On miss: calls `codeToAst` (→ clone), then runs **one** `traverse()` over the
  AST visiting `ExportDeclaration`. Builds a `Map<string, ExportDependencies>`
  mapping each export name → `{ topLevelStatements, topLevelNonModuleStatements,
importedIdentifierNames, exportedVariableDeclarators }`.
- Helper `getDependentIdentifiersForPath` (317) walks scope to find all
  identifier dependencies of an export; `getTopLevelStatementsForPaths` (385)
  lifts those to their top-level owning statement.
- This is the single traversal pass; its result is reused by every chunkability
  check and every chunk-extraction.

### 3c. `hasChunkableExport` — dependency-overlap check (lines 460-516)

- Cached at `${ck}::hasChunkableExport::${exportName}`, version = `code`.
- On miss: calls `getExportDependencies` (cache hit if already computed), then
  checks that the export's top-level non-module statements don't overlap with
  any other export's (using `setsIntersect`), and that it doesn't share a
  variable declarator with siblings. Returns `false` if any overlap → that
  export cannot be cleanly split out.
- Called 4× per `detectRouteChunks` (one per `routeChunkExportName`).

### 3d. `getChunkedExport` — generate a single export chunk (lines 518-617)

- Cached at `${ck}::getChunkedExport::${exportName}::${JSON.stringify(generateOptions)}`,
  version = `code`.
- On miss: calls `hasChunkableExport` (hit), `getExportDependencies` (hit),
  `codeToAst` (**clone**), then filters `ast.program.body` keeping only the
  dependency statements, prunes import specifiers and export declarations,
  and calls **`generate(ast, generateOptions)`**.

### 3e. `omitChunkedExports` — generate the "main" chunk (lines 619-758)

- Cached at `${ck}::omitChunkedExports::${exportNames.join(',')}::${JSON.stringify(generateOptions)}`,
  version = `code`.
- On miss: calls `hasChunkableExport` for every export name (to classify
  omit vs retain), `getExportDependencies` (hit), `codeToAst` (**clone**),
  filters out omitted statements/declarators/specifiers, then **`generate()`**.
- Returns `undefined` if nothing remains (the caller substitutes a no-op
  snippet).

---

## 4. Who calls what — the per-module call sequence during a build

The cache is shared, so for a given route module file the operations compose.
For a module that splits into **main + 2 chunkable exports** (e.g.
clientAction, clientLoader), across one build the code paths execute:

| #   | Caller site                                          | Fns invoked (cold)                                                                                                                                     | Redundant on warm                                                       |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 1   | split-exports transform (index.ts:1509)              | `detectRouteChunksIfEnabled` → 4× `hasChunkableExport` → `getExportDependencies`(miss: parse+**clone**+traverse)                                       | —                                                                       |
| 2   | client-entry transform (index.ts:1383)               | `detectRouteChunksIfEnabled` → 4× `hasChunkableExport` (**hits**)                                                                                      | clones avoided (hasChunkableExport hit short-circuits before codeToAst) |
| 3   | manifest generation (manifest.ts:204)                | `detectRouteChunksIfEnabled` → 4× `hasChunkableExport` (**hits**)                                                                                      | —                                                                       |
| 4   | route-chunk transform `main` (index.ts:1446)         | `getRouteChunkIfEnabled` → `omitChunkedExports`(miss) → `hasChunkableExport`(hits), `getExportDependencies`(hit), `codeToAst`(**clone**), `generate()` | —                                                                       |
| 5   | route-chunk transform `clientAction` (index.ts:1446) | `getRouteChunkIfEnabled` → `getChunkedExport`(miss) → `codeToAst`(**clone**), `generate()`                                                             | —                                                                       |
| 6   | route-chunk transform `clientLoader` (index.ts:1446) | `getRouteChunkIfEnabled` → `getChunkedExport`(miss) → `codeToAst`(**clone**), `generate()`                                                             | —                                                                       |

**Net per cold module (main + 2 chunks):**

- `parse()`: **1×** (cached at codeToAst).
- `structuredClone()`: **4×** — once in `getExportDependencies` (#1), once each
  in `omitChunkedExports` (#4), `getChunkedExport` (#5, #6). Every clone is a
  full deep copy of the AST, paid even though the _parse_ was cached.
- `traverse()`: **1×** (in `getExportDependencies`).
- `generate()`: **3×** — one per chunk (main + 2 named). Each operates on its
  own cloned, filtered AST; cannot be shared because the program bodies differ.

Sites #2 and #3 (client-entry, manifest) are cheap warm reads: `hasChunkableExport`
hits short-circuit before any `codeToAst`/clone. They add zero parse/clone/generate
cost on the second invocation.

---

## 5. Input keys that determine reuse vs cache miss

- **Identity key** = `normalizeRelativeFilePath(id)` → file path relative to
  `appDirectory`, normalized, query string stripped. Two resources with the
  same path stem (differing only by `?route-chunk=` / `?react-router-route` /
  `?__react-router-build-client-route`) share **all** chunk-cache entries.
- **Version** = the exact `code` string. Any byte-level difference in the
  transformed ESM string invalidates **every** entry for that path (re-parse,
  re-traverse, re-generate), because all sites pass `code` as the version.
- **Sub-key discriminators** (appended after the path prefix):
  - `::codeToAst` — parse result.
  - `::getExportDependencies` — dependency map.
  - `::hasChunkableExport::${name}` — per-export chunkability boolean.
  - `::getChunkedExport::${name}::${JSON.stringify(generateOptions)}` — per-export generated code.
  - `::omitChunkedExports::${names.join(',')}::${JSON.stringify(generateOptions)}` — main-chunk generated code.
    All callers currently pass `generateOptions = {}`, so the JSON suffix is
    constant `"{}"`.

### Cache-miss triggers (correctness-relevant)

- **Code-source divergence**: the transform path derives `code` via
  `transformToEsm(args.code, args.resourcePath)` (bundler-supplied source),
  while the manifest path derives it via `getRouteModuleAnalysis` →
  `readFile(resourcePath)` → `transformToEsm(source, resourcePath)` (disk read).
  If the bundler's `args.code` ever differs from the disk file content (e.g.
  different source after a preceding loader, or normalization differences),
  the `version` strings differ and the manifest path silently re-parses /
  re-traverses instead of hitting the cache. In a clean build they coincide,
  but the equality is **assumed, not enforced**.

---

## 6. Correctness assumptions embedded in the flow

1. **AST mutation requires isolation** — `structuredClone` in `codeToAst`
   exists because `getChunkedExport` and `omitChunkedExports` rewrite
   `ast.program.body` in place. Removing the clone without another isolation
   strategy (e.g. per-consumer filtered views, or re-parsing) would corrupt
   shared state across the main/named chunks of the same module.

2. **`getExportDependencies` maps export name → dependency sets for ALL exports**,
   and chunkability is defined by _pairwise non-overlap_ of top-level
   statements and variable declarators. An export is only chunkable if its
   statements/declarators are disjoint from every sibling's. `omitChunkedExports`
   relies on the same map to know exactly which statements to remove for "main".

3. **`t.isNodesEquivalent` is used for structural identity** when filtering
   `ast.program.body` against the dependency sets (getChunkedExport:556,
   omitChunkedExports:684,713). Because the dependency sets were built from a
   _different_ AST clone than the one being filtered, node identity (`===`)
   would fail; structural (deep) equivalence is required and is assumed to be
   sound for the statement shapes Babel produces.

4. **Chunkability is all-or-nothing per export** — if an export shares a
   top-level statement with any sibling, it is reported as non-chunkable
   (`hasChunkableExport` returns `false`) and stays in the main chunk. There is
   no partial-split mode.

5. **`generateOptions` is part of the cache key** (JSON-serialized) but always
   `{}` at present, so the discriminator is inert. If a caller ever passed
   non-default options (e.g. source maps), it would create a separate cache
   entry and re-generate independently.

6. **Root route module is always excluded** — `detectRouteChunksIfEnabled`
   returns a no-chunks result for `isRootRouteModuleId` before any parse, so
   `root.tsx` never enters the parse/clone/traverse pipeline.

7. **Cheap pre-filter**: `detectRouteChunksIfEnabled` bails early if
   `!code.includes(exportName)` for any of the 4 export names, skipping the
   entire parse/traverse for modules with no chunkable exports. This is a
   substring test, not a parse — fast but coarse.

---

## 7. Summary of optimization-relevant findings

- The **parse** is already well-cached (1 per module per build).
- The **traverse** is already well-cached (1 per module per build).
- **`structuredClone` is the redundant hot spot**: it runs once per chunk
  (1 + N clones for a module with N chunkable exports), each cloning the full
  AST. Since each chunk needs a _differently filtered_ AST, the clones aren't
  avoidable in the current "clone-then-filter-then-generate" design — but the
  clone cost scales with AST size × chunk count.
- **`generate`** runs once per chunk (main + N named) and is inherently
  per-chunk (different program bodies). This is the floor of work.
- **Cross-caller reuse works correctly** for the dependency analysis
  (`getExportDependencies`, `hasChunkableExport`) because those are pure reads
  that don't mutate the AST — only the chunk _generation_ steps clone+mutate.
