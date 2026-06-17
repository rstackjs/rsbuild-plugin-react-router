# Implementation Plan: Single-Pass Route Chunk Precompute

**Kanban:** `t_f8636ea4` (synthesis) → triage root `t_d3ed9b84`
**Branch:** `perf/bundling-performance` (PR #39 — _Add React Router plugin performance benchmarks_)
**Head at authoring:** `c2452de`
**Scope of this plan:** `src/route-chunks.ts` only (no edits to `src/index.ts` or `src/manifest.ts`).

**Source artifacts this plan synthesizes (read these for full detail, the plan below is self-contained):**

- `route-chunk-parse-traverse-analysis.md` — current-behavior map (parent `t_0f2688a9`)
- `.benchmark/design/route-chunk-analysis.md` — cache representation design (parent `t_34486796`)
- `task/route-chunk-correctness-test-spec.md` — 50+ named correctness tests (parent `t_1c0421c6`)
- `benchmarks/chunk-precompute-methodology.md` — A/B benchmark commands (parent `t_4d84984e`)

---

## 0. Headline answers (acceptance criteria, up front)

| Question                                                               | Answer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Can all chunks for one route be computed from one parse/traverse pass? | **Yes.** Parse and traverse are _already_ single-pass today (cached once per `(path, code)`). The avoidable cost is not re-parsing — it is (a) `structuredClone` of the full AST on every `codeToAst` call (~6× per splittable module) and (b) the `t.isNodesEquivalent` membership scans (O(body × deps) per generate).                                                                                                                                                                                                                                                                                                   |
| Store generated chunk code, or AST + metadata?                         | **Store AST + index-based metadata, generate on demand (design "Option B").** Do NOT pre-generate and cache chunk strings: only the `?route-chunk=` transform hook ever reads chunk text (1 of the 4 consumers); the manifest + client-entry + split-exports hooks consume only `hasRouteChunkByExportName` / `chunkedExports`. Eagerly materializing 5 strings per module wastes the single biggest retained object. Generating from a pre-filtered node array is cheap; the expensive part today is the parse + full-AST clone _before_ generate, which Option B removes entirely while preserving byte-for-byte output. |
| Exact tests?                                                           | §6 below: 3 existing → ~50 tests per `task/route-chunk-correctness-test-spec.md`; the differential equivalence oracle (`C-Cache-04`) is mandatory before flipping the default.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Exact benchmark commands?                                              | §7 below, lifted from `benchmarks/chunk-precompute-methodology.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Implementer re-triage needed?                                          | **No.** Steps §4 are ordered, name exact files/functions/line numbers, and each carries its own verification gate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

---

## 1. Current state (ground truth, verified at `c2452de`)

All references are `src/route-chunks.ts` unless noted.

```
codeToAst (L87-97)             → parse() cached at ${ck}::codeToAst; structuredClone RUNS ON EVERY CALL (cache hit or miss)
getExportDependencies (L158-315)→ one traverse() building Map<name, ExportDependencies{node-ref Sets}>; cached ${ck}::getExportDependencies
hasChunkableExport (L460-516)  → set-intersection over ExportDependencies; cached ${ck}::hasChunkableExport::${name}
getChunkedExport (L518-617)    → codeToAst(CLONE) + filter body via t.isNodesEquivalent + generate(); cached ${ck}::getChunkedExport::${name}::opts
omitChunkedExports (L619-758)  → codeToAst(CLONE) + filter body via t.isNodesEquivalent + generate(); cached ${ck}::omitChunkedExports::${names}::opts
detectRouteChunks (L760-780)   → hasChunkableExport ×4
getRouteChunkCode (L782-797)   → dispatch 'main'→omitChunkedExports, named→getChunkedExport
detectRouteChunksIfEnabled (L834-868) → guards (splitRouteModules / root / substring) then detectRouteChunks
getRouteChunkIfEnabled (L870-888)     → guards (splitRouteModules only — NO root guard, intentional) then getRouteChunkCode
```

Per-module cost for a 4-export splittable route across one build (3 transform hooks + manifest + 5 `?route-chunk=` queries share one `routeChunkCache`):

- `parse()`: **1×** (cached) — already optimal.
- `traverse()`: **1×** (cached) — already optimal.
- `generate()`: **5×** (main + 4 named) — inherent floor, each chunk is a distinct program.
- `structuredClone()`: **~6×** of the **full AST** (1 in `getExportDependencies` miss + 4 in `getChunkedExport` + 1 in `omitChunkedExports`) — **the avoidable hot spot.**
- `t.isNodesEquivalent` scans: O(body × deps) per generate — **the second avoidable cost.**

Cache primitive: `getOrSetFromCache(cache, key, version, getValue)` (L69), `version === code` (full source text) at every site. The shared `routeChunkCache: RouteChunkCache = new Map()` is created once per plugin instance at `src/index.ts:403` and passed by reference to manifest (`index.ts:408`) and the three transform hooks (`index.ts:1384/1447/1510`). No config-coupled keying.

---

## 2. Target design (what the implementer builds)

Collapse the scatter of `getOrSetFromCache` entries (`codeToAst`, `getExportDependencies`, `hasChunkableExport` ×4, `getChunkedExport` ×N, `omitChunkedExports`) into **one analysis object per route module**, computed in one parse + one traverse, cached under one key.

```ts
// NEW types in src/route-chunks.ts
type ExportDependencyIndex = {
  // Indices into ast.program.body — plain serializable data, never node references.
  topLevelStatementIndices: ReadonlySet<number>;
  topLevelNonModuleStatementIndices: ReadonlySet<number>;
  importedIdentifierNames: ReadonlySet<string>;
  exportedDeclaratorIndex: number; // -1 if not a var-declarator
  exportedDeclaratorParentIndex: number; // for destructuring-export binding lookup
};

type RouteChunkAnalysis = {
  readonly code: string; // doubles as cache version
  readonly ast: t.File; // IMMUTABLE shared AST — consumers never mutate
  readonly exports: Map<string, ExportDependencyIndex>; // keyed by export name
  readonly topLevel: readonly t.Statement[]; // alias of ast.program.body (stable: body never reordered)
  readonly chunkableExports: ReadonlySet<RouteChunkExportName>; // materialized once from exports
};
```

**Why indices, not node references:** the current `ExportDependencies` stores `Set<t.Statement>` / `Set<t.VariableDeclarator>` and re-identifies them via `t.isNodesEquivalent` (L550/584/670/715). That is both mutation-unsafe (forces the per-call `structuredClone`) and O(n×m) per match. Index-based metadata is plain data, survives across the immutable shared AST with zero aliasing risk, and lets `getRouteChunkCode` select statements by array index in O(1).

**Constructor:**

```ts
// NEW in src/route-chunks.ts — replaces codeToAst+getExportDependencies+hasChunkableExport trio
const analyzeRouteModule = (
  code: string,
  cache: RouteChunkCache | undefined,
  cacheKey: string
): RouteChunkAnalysis => {
  // one getOrSetFromCache under `${cacheKey}::analysis`, version = code.
  // On miss: parse(code) once, traverse once to record ExportDependencyIndex map,
  //          derive chunkableExports (same intersection rule as hasChunkableExport L477-513),
  //          return the analysis. Reuse getDependentIdentifiersForPath /
  //          getTopLevelStatementPathForPath helpers unchanged — just record body.indexOf(path.node).
};
```

**Consumers rewritten:**

- `detectRouteChunks` → reads `analysis.chunkableExports`; no per-export `hasChunkableExport` calls.
- `getChunkedExport` / `omitChunkedExports` → `analyzeRouteModule(...)`, select `analysis.topLevel[i]` by stored indices, build `t.program([...])`, call `t.cloneNode(node, false)` only on the narrowed import/export nodes, `generate()`. **Delete the `t.isNodesEquivalent` scans (L550/584/670/715) entirely** — selection is by index.
- `codeToAst` → **deleted** (no callers after the rewrite).
- `getExportDependencies` body → moves into the `analyzeRouteModule` miss-closure, refactored to record indices; the standalone function is removed.
- `hasChunkableExport` → removed; logic folds into `analyzeRouteModule`'s `chunkableExports` derivation.

**Public signatures unchanged:** `detectRouteChunks`, `getRouteChunkCode`, `detectRouteChunksIfEnabled`, `getRouteChunkIfEnabled`, `validateRouteChunks` keep their current signatures. `src/index.ts` and `src/manifest.ts` need **zero edits** — they already pass the shared `routeChunkCache`.

**Root route, substring guard, enforce validation, empty-chunk snippet:** stay exactly where they are (pre-analysis early returns / caller policy). The analysis is a pure function of source code and must not encode any of them — see `.benchmark/design/route-chunk-analysis.md` §9 for the rationale (baking root-route suppression into the cache would couple the key to config and break cross-caller reuse).

---

## 3. Toggle (transient scaffolding, not a permanent flag)

To measure old vs new on **one commit** (required by the benchmark methodology), gate the new path behind an env var for exactly one measured commit, then delete it.

```ts
// src/route-chunks.ts
const PRECOMPUTE_ENABLED = process.env.ROUTE_CHUNK_PRECOMPUTE === '1';
```

- `detectRouteChunks` and `getRouteChunkCode` branch on `PRECOMPUTE_ENABLED`: old branch keeps today's codeToAst/structuredClone/isNodesEquivalent path; new branch calls `analyzeRouteModule` + index selection.
- The toggle exists **only** for the A/B benchmark + differential-equivalence commit. The very next commit (after §6 + §7 are green) deletes the old branch and the constant — it is not a shipped feature flag. (If a permanent opt-out is later wanted, promote it to `pluginReactRouter({ future: { v8_routeChunkPrecompute } })`, but that is out of scope here.)

---

## 4. Ordered implementation steps

Each step is independently verifiable. Do not skip the RED-test step — it is the contract the refactor is proven against.

### Step 0 — RED: pin current behavior (no src changes)

**Files:** `tests/route-chunks.test.ts` (expand), `tests/route-chunks-cache.test.ts` (new), `tests/fixtures/route-chunks/` (new).
**What:** Implement §4–§9 of the correctness spec against the **current** API. Concretely: `D-Detect-01..08`, `G-Gen-01..08`, `F-Mode-01..03`, `E-Root-01..04`, `V-Enforce-01..04`, `C-Cache-01..06` (write `C-Cache-04` against the current API as the reference oracle; mark the precompute-API half `it.skip`), and the `M-Manifest-01..06` expansions. Defer `T-Transform-01..05` (§8c) to Step 5 — they need the stub harness.
**Why:** These are the golden values the refactor must preserve byte-for-byte. Writing them first means every later step is gated by a green suite, not by reading prose.
**Verify:** `pnpm exec rstest run` — all new + existing (3) tests green against unchanged `src/`.
**Acceptance:** spec's verified-behavior table (§2) reproduced as passing assertions.

### Step 1 — Add the analysis layer in parallel (old path still live)

**File:** `src/route-chunks.ts`.
**What:** Add the `ExportDependencyIndex` + `RouteChunkAnalysis` types and `analyzeRouteModule`. Port the `getExportDependencies` body into the miss-closure, recording `body.indexOf(path.node)` instead of node references. Derive `chunkableExports` using the same intersection + single-declarator rule as `hasChunkableExport` (L477-513). Wire it through `setBoundedCacheEntry`-style insertion so the new single entry respects the existing cap (reuse the helper from `src/export-utils.ts`; the cap constant is `MAX_EXPORT_UTILS_CACHE_ENTRIES = 2048`). Do **not** wire it into any consumer yet — it is dead code exercised only by a unit test.
**Why:** Isolates the representation change from the consumer rewrite. If indices are wrong, the failure is local to this step's unit test, not a cascade through 4 consumers.
**Verify:** add one unit test that calls `analyzeRouteModule` directly (export it test-only or via a thin internal wrapper) and asserts `chunkableExports` matches `hasChunkableExport` for every fixture from Step 0. `pnpm exec rstest run`.
**Acceptance:** analysis output == old detection output for all Step-0 fixtures.

### Step 2 — Route detection through the analysis (toggle-gated)

**File:** `src/route-chunks.ts`.
**What:** Branch `detectRouteChunks` on `PRECOMPUTE_ENABLED`. New branch returns `{ hasRouteChunks, hasRouteChunkByExportName, chunkedExports }` derived from `analyzeRouteModule(...).chunkableExports`. Old branch untouched.
**Verify:** `ROUTE_CHUNK_PRECOMPUTE=0 pnpm exec rstest run` (old path, all green) **and** `ROUTE_CHUNK_PRECOMPUTE=1 pnpm exec rstest run` (new path, all green). The `C-Cache-04` oracle is the headline equivalence check.
**Acceptance:** both toggle values produce identical `RouteChunkInfo` for every fixture.

### Step 3 — Chunk generation through the analysis (toggle-gated)

**File:** `src/route-chunks.ts`.
**What:** Branch `getRouteChunkCode` (and through it `getChunkedExport` / `omitChunkedExports`) on `PRECOMPUTE_ENABLED`. New branch: `analyzeRouteModule(...)`, select `analysis.topLevel[i]` by the stored indices, `t.cloneNode(node, false)` on narrowed import/export nodes only, `t.program([...])`, `generate(program, {})`. **Delete the `t.isNodesEquivalent` scans in the new branch** — selection is by index. `generateOptions` stays `{}` (kept in the cache key for forward-compat, unchanged). Old branch untouched.
**Verify:** both toggle values green; additionally run the **byte-for-byte differential** — for every fixture × every chunk name, `ROUTE_CHUNK_PRECOMPUTE=0` output === `ROUTE_CHUNK_PRECOMPUTE=1` output (string equality). This is `C-Cache-04` extended to generation, and the design's mandatory safeguard (risk #4).
**Acceptance:** zero byte drift across all chunks. Emitted chunk hashes do not change.

### Step 4 — Dev-mode immutability guard

**File:** `src/route-chunks.ts`.
**What:** In the `analyzeRouteModule` miss-closure (dev/non-production only), `Object.freeze`-shallow `analysis.ast.program.body` and assert in each new-branch consumer that the array length is unchanged before/after selection. Add a code comment at every `t.cloneNode(node, false)` site stating the shallow-clone invariant (mutation reassigns only a top-level array property — `node.specifiers` / `declaration.declarations`).
**Why:** The whole design rests on `ast.program.body` never being reordered or mutated between analysis and generation. Today's code already treats it as read-only up to the post-clone mutation, so the guard is cheap insurance (design risk #1, #3).
**Verify:** `ROUTE_CHUNK_PRECOMPUTE=1 pnpm exec rstest run`; the freeze guard must not fire on any fixture.

### Step 5 — Transform-integration tests (§8c of the spec)

**Files:** `tests/route-chunk-transforms.test.ts` (new), reuse `createStubRsbuild` from `tests/setup.ts`.
**What:** Implement `T-Transform-01..05`. If the stub harness cannot isolate a single transform invocation, ship as `it.skip` with the assertion encoded in a comment (per spec §11.1) — do not block the refactor on harness work.
**Verify:** `pnpm exec rstest run` (both toggle values for the non-skipped ones).

### Step 6 — Cleanup: delete the old path and the toggle

**File:** `src/route-chunks.ts`.
**What:** Remove the `PRECOMPUTE_ENABLED` constant, the old branches in `detectRouteChunks` / `getRouteChunkCode`, and the now-dead `codeToAst`, `getExportDependencies`, `hasChunkableExport` functions. Convert `C-Cache-04`'s `it.skip` precompute-API half into the live assertion (or delete the skip if the test already asserts via the now-only path). The differential test from Step 3 becomes a no-op (only one path) — keep it as a snapshot/golden regression or delete per `task/route-chunk-correctness-test-spec.md` guidance.
**Prerequisite:** §6 testing sequence green **and** §7 benchmark sequence shows the expected win (§5) with no RSS regression.
**Verify:** `pnpm exec rstest run` + `pnpm build` + `pnpm run format`.

---

## 5. Expected performance wins

Derived from the current-state map + design; confirm with §7 before locking in.

| Metric (per splittable route module, 4 exports) | Today                             | After                                                | Δ                                                     |
| ----------------------------------------------- | --------------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| `parse()` calls                                 | 1 (cached)                        | 1                                                    | 0 — already optimal                                   |
| `traverse()` calls                              | 1 (cached)                        | 1                                                    | 0 — already optimal                                   |
| `generate()` calls                              | 5                                 | 5                                                    | 0 — inherent floor                                    |
| `structuredClone(full AST)` calls               | ~6                                | **0**                                                | −6 full-tree deep clones/module                       |
| `t.isNodesEquivalent` scans                     | O(body × deps) × 5                | **0** (index lookup)                                 | removed                                               |
| Cache map entries / module                      | ~8                                | **1**                                                | −87% entries; ~8× better LRU coverage at the 2048 cap |
| Peak transient memory                           | 6 full-AST clone copies/module    | 0 transient clones                                   | sharp drop in GC pressure                             |
| Steady-state retained                           | node-ref Sets + 1-5 chunk strings | index maps (≪ node Sets); 0 chunk strings by default | modest drop                                           |

Headline: **all chunks for one route already come from one parse + one traverse; the win is eliminating ~6 full-AST `structuredClone`s and the `isNodesEquivalent` scans per splittable module.** CPU-time and `route:chunk.totalMs` should drop with no peak-RSS regression beyond the retained `RouteChunkAnalysis` heap cost (quantified separately by the micro-benchmark).

---

## 6. Testing sequence

Conventions: rstest (`@rstest/core`), ESM, `tests/**/*.test.ts` auto-included via `rstest.config.ts`, `tests/setup.ts` mocks `node:fs` + provides `createStubRsbuild`. Assert generated code by re-parsing with `getExportNames` (from `src/export-utils`) and checking export/import membership — **never** assert `generate()` whitespace.

```sh
# 0. Full suite, current code (baseline green) — run once before starting
pnpm exec rstest run

# 1. After each step — both toggle values for Steps 2-5
ROUTE_CHUNK_PRECOMPUTE=0 pnpm exec rstest run   # old path
ROUTE_CHUNK_PRECOMPUTE=1 pnpm exec rstest run   # new path

# 2. Type check + format + build (after Step 6)
pnpm run build
pnpm run format
```

**Mandatory tests (from `task/route-chunk-correctness-test-spec.md`):**

- §4 detection: `D-Detect-01..08` (incl. verified single-bind destructure chunkable, multi-bind not, default-export sharing).
- §5 generation: `G-Gen-01..08` (incl. verified empty-main → `undefined`, non-chunkable → `undefined`).
- §6 mode/early-exit: `F-Mode-01..03` (incl. verified substring false-positive does not chunk).
- §7 root: `E-Root-01..04` (incl. **verified root-guard asymmetry** — `getRouteChunkIfEnabled` has NO root guard; pin it).
- §8 enforce + consumers: `V-Enforce-01..04`, `M-Manifest-01..06` (incl. **H1 critical** `M-Manifest-03` — entry created via substring but `*Module` field absent when not splittable), `T-Transform-01..05`.
- §9 cache: `C-Cache-01..06`. **`C-Cache-04` (single-pass equivalence oracle) and `C-Cache-06` (cache shared across index + manifest callers) are the headline regression guards — the refactor is built against them.**

Today's `tests/route-chunks.test.ts` has 3 tests; the spec takes it to ~50. The implementer writes §4–§7 first (pure units), then §9 (cache backbone), then §8b (manifest via `createTempApp`), then §8c (transforms, `it.skip` if the stub can't isolate).

---

## 7. Benchmark sequence

Lifted verbatim from `benchmarks/chunk-precompute-methodology.md` — run after Step 5 (toggle live, both paths in one commit) and before Step 6 (cleanup).

**Pre-flight:**

```sh
git status --short          # confirm tree state (note: src/performance.ts has an unrelated uncommitted sort tweak — commit/leave separately, not part of this plan)
pnpm install
pnpm build
node --version              # record (v22.x here)
```

**End-to-end (primary comparison, 256 routes):**

```sh
ROUTE_CHUNK_PRECOMPUTE=0 pnpm bench:baseline \
  --profile default --iterations 8 --warmup 2 --clean build \
  --format both --out .benchmark/results/lazy

ROUTE_CHUNK_PRECOMPUTE=1 pnpm bench:baseline \
  --profile default --iterations 8 --warmup 2 --clean build \
  --format both --out .benchmark/results/precompute
```

Compare the `synthetic-256-ssr-esm-split` row (code path that changes) **and** the `synthetic-256-ssr-esm` row (non-split control — must show no meaningful diff; if it diverges, the toggle is leaking, which is a bug).

**Scaling sweep (does the win grow with route count?):**

```sh
for PRECOMPUTE in 0 1; do
  ROUTE_CHUNK_PRECOMPUTE=$PRECOMPUTE pnpm bench:full \
    --profile full --filter split \
    --iterations 5 --warmup 1 --clean build \
    --out .benchmark/results/scale-precompute-$PRECOMPUTE
done
```

**Micro-benchmark (direct parse/traverse/generate/structuredClone attribution):**
Create `scripts/bench-chunk-analysis.mjs` (imports the analysis fns from `dist/`, runs over generated route modules in-process). Then:

```sh
node scripts/bench-chunk-analysis.mjs --routes 256 --variant ssr-esm-split \
  --iterations 50 --warmup 5 --mode lazy    --out .benchmark/results/micro-lazy.json
node scripts/bench-chunk-analysis.mjs --routes 256 --variant ssr-esm-split \
  --iterations 50 --warmup 5 --mode precompute --out .benchmark/results/micro-precompute.json
```

**Metrics to report** (per methodology §5): CPU time (`userMs+sysMs` median), wall median, peak RSS p95, `route:chunk` / `route:split-exports` / `route:client-entry` `totalMs`+`maxMs`, and from the micro: `parse`/`traverse`/`generate`/`structuredClone` call counts per route, per-route mean ms, heap delta. Expected micro signature: precompute shows `parse = routeCount` (1/module) vs lazy's `≤ 5×routeCount`, and `structuredClone ≈ 0`.

**A win =** CPU time and `route:chunk.totalMs` drop, no peak-RSS regression beyond the retained `RouteChunkAnalysis` heap cost. Fill the comparison table template in methodology §7.3.

**Hygiene:** benchmark output is gitignored under `.benchmark/`. Clean with `rm -rf .benchmark/` — **not** `git clean -fdX` (also nukes `node_modules/` and `.tracedecay/`). Pin one Node version; run both halves back-to-back with no other load.

---

## 8. Compatibility risks + mitigations

| #   | Risk                                                                                                                                                                                                                                  | Mitigation                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Index stability.** Design rests on `ast.program.body` never being reordered between analysis and generation.                                                                                                                        | Dev-mode `Object.freeze`-shallow on `body` (Step 4) + length assertions. Low risk — today's code already treats parsed body as read-only up to the post-clone mutation.   |
| 2   | **Byte-for-byte output drift.** `generate()` output changing would invalidate downstream chunk hashes / break snapshot tests.                                                                                                         | Mandatory differential test (Step 3): old vs new `getRouteChunkCode` output === for every fixture × chunk name, both toggle values. Do not proceed to Step 6 until green. |
| 3   | **`t.cloneNode(node, false)` correctness.** Shallow clone is safe only because mutation reassigns a single top-level array property. A future deep-edit would silently share state.                                                   | Code comment at every clone site + the Step 4 freeze guard.                                                                                                               |
| 4   | **Root-guard asymmetry (load-bearing).** `detectRouteChunksIfEnabled` suppresses root; `getRouteChunkIfEnabled` does NOT. Callers only ever request root chunks they never created.                                                   | `E-Root-03` pins it explicitly. The refactor preserves both guards exactly where they are — the analysis encodes neither.                                                 |
| 5   | **Entry/manifest disagreement (H1).** Bundler entries are created via substring (`source.includes(name)`); manifest `*Module` fields via detect. They can disagree for non-splittable exports.                                        | `M-Manifest-03` + `T-Transform-05` pin it. Refactor preserves: entry path unchanged (substring in `index.ts`, not touched), manifest path consumes `chunkableExports`.    |
| 6   | **Code-source divergence (pre-existing).** Transform path gets `code` from `args.code`; manifest path from `readFile`. If they ever differ, version strings differ and the manifest re-parses.                                        | Pre-existing; the refactor does not worsen it (still versions by full `code`). Flagged in the behavior map §5; out of scope here.                                         |
| 7   | **Cache eviction pattern change.** ~8 entries/module → 1 entry/module changes LRU eviction. At cap 2048 this is strictly better coverage (~2048 modules vs ~256).                                                                     | Confirm cap not lowered under the new shape (it isn't — reuses `MAX_EXPORT_UTILS_CACHE_ENTRIES`).                                                                         |
| 8   | **Free-floating top-level side effects.** Statements not in any chunkable export's dependency closure must land in `main` only. Subtle — index-selection preserves today's `omitChunkedExports` keep-everything-not-omitted behavior. | Test matrix must include a module with a free-floating top-level statement; assert it lands in `main` and nowhere else (spec §9 risk #7).                                 |

---

## 9. Rollback strategy

1. **Per-commit reversibility.** Steps 0-5 each leave the old path fully functional behind `ROUTE_CHUNK_PRECOMPUTE=0`. A bad step is reverted with a single `git revert` of that step's commit; production is unaffected because the default is the old path until Step 6.
2. **Toggle kill-switch.** If the new path misbehaves after Step 6 (toggle deleted), `git revert` the Step 6 commit restores the toggle, then set `ROUTE_CHUNK_PRECOMPUTE=0` while diagnosing. Because Steps 1-5 are independently revertible, you can also roll back to any intermediate state.
3. **No data/manifest migration.** The change is internal to `src/route-chunks.ts`; public signatures, emitted chunk bytes (proven by the differential test), and the manifest shape are identical. There is nothing to migrate or restore on the consumer side — rollback is purely source-level.
4. **No persisted state.** `routeChunkCache` is in-memory, per plugin instance, never serialized. A rollback takes effect on the next build with no cleanup.

The safest sequencing: land Steps 0-5 as one PR (or PR-range) on `perf/bundling-performance` with the toggle defaulting to old; run §7; only after the win is confirmed and §6 is green, land Step 6 as a follow-up commit deleting the toggle.

---

## 10. Out of scope (explicit non-goals)

- **`getExportNames` consolidation.** `src/index.ts` calls `getExportNames` via a separate `mlly`/`es-module-lexer` parser (different from Babel). Merging it into the single Babel traverse is theoretically possible but couples the chunk pipeline to the export-name contract and risks `export *` divergence. Flagged as a future consolidation, not a blocker (design §9 #6).
- **`getDependentIdentifiersForPath` resolver cost.** The scope-walking per export is the real CPU cost inside the single traverse; moving to indices does not speed it up. If profiling later shows it dominates, that is a separate memoization optimization.
- **Permanent feature flag / `future` opt-out.** The toggle is transient scaffolding for measurement, deleted in Step 6.
- **Lazy per-chunk string memo.** A `Map<RouteChunkName, string>` on top of Option B so each `generate()` runs at most once per build is a cheap follow-on micro-optimization, not part of the core representation (design §3 hybrid note).
- **`src/performance.ts` uncommitted change** (slowest-list sort + hoisted `resolvedEnvironment`) — orthogonal perf tweak on this branch; commit or leave separately, not part of this plan.
