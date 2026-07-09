# Core Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove four local duplications/diagnostic defects without changing public behavior.

**Architecture:** Keep public plugin APIs and execution stages unchanged. Consolidate private control flow and predicates, then cover the only user-visible diagnostic correction through the public prerender entry point.

**Tech Stack:** TypeScript, Rstest, Effect, Rsbuild/Rspack plugin APIs.

## Global Constraints

- Keep Yuku primary and Rspack SWC as the TS/TSX-only correctness fallback.
- Preserve `generateReactRouterManifestForDev`'s public signature.
- Preserve the `report` process-assets stage for both build and development.

---

### Task 1: Browser Manifest Hook Registration

**Files:**
- Modify: `src/modify-browser-manifest.ts:210-232`
- Test: `tests/modify-browser-manifest.test.ts`
- Test: `tests/index.test.ts`

**Interfaces:**
- Consumes: `finalizeSri: boolean`, `buildAndEmitManifest(context, { withSri })`
- Produces: one `api.processAssets` registration with unchanged descriptor

- [ ] **Step 1: Run existing coverage**

Run: `pnpm exec rstest run -c ./rstest.config.ts tests/modify-browser-manifest.test.ts tests/index.test.ts`

Expected: PASS.

- [ ] **Step 2: Consolidate the registration**

Replace the build/dev branches with:

```ts
api.processAssets({ stage: 'report', environments: ['web'] }, context =>
  buildAndEmitManifest(context, { withSri: finalizeSri })
);
```

Keep the existing explanation that the report stage is required after `realContentHash` and late CSS attachment.

- [ ] **Step 3: Re-run coverage**

Run: `pnpm exec rstest run -c ./rstest.config.ts tests/modify-browser-manifest.test.ts tests/index.test.ts`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/modify-browser-manifest.ts
git commit -m "refactor: consolidate browser manifest hook"
```

### Task 2: Private Manifest Parameter

**Files:**
- Modify: `src/manifest.ts:494-641`
- Test: `tests/manifest.test.ts`
- Test: `tests/manifest-version.test.ts`
- Test: `tests/manifest-split-route-modules.test.ts`

**Interfaces:**
- Consumes: exported `generateReactRouterManifestForDev(routes, options, clientStats, context, assetPrefix, manifestOptions)`
- Produces: private `generateReactRouterManifestForDevEffect(routes, clientStats, context, assetPrefix, manifestOptions)`

- [ ] **Step 1: Remove the unused private parameter**

Delete `_options: PluginOptions` from `generateReactRouterManifestForDevEffect` and omit `options` from its internal call. Do not alter the exported signature.

- [ ] **Step 2: Run affected tests**

Run: `pnpm exec rstest run -c ./rstest.config.ts tests/manifest.test.ts tests/manifest-version.test.ts tests/manifest-split-route-modules.test.ts`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/manifest.ts
git commit -m "refactor: trim private manifest arguments"
```

### Task 3: RSC Style Import Predicate

**Files:**
- Modify: `src/rsc-route-transforms.ts:102-134`
- Test: `tests/rsc-route-transforms.test.ts`

**Interfaces:**
- Produces: `isSideEffectStyleImport(statement: AnyNode): boolean`

- [ ] **Step 1: Extract the predicate**

```ts
const isSideEffectStyleImport = (statement: AnyNode): boolean => {
  if (
    statement.type !== 'ImportDeclaration' ||
    (statement.specifiers ?? []).length > 0
  ) {
    return false;
  }
  const source = statement.source;
  return (
    typeof source?.value === 'string' &&
    STYLE_SIDE_EFFECT_IMPORT_SOURCE.test(source.value)
  );
};
```

Use `!isSideEffectStyleImport(statement)` in `filter` and `isSideEffectStyleImport` in `some`.

- [ ] **Step 2: Run affected tests**

Run: `pnpm exec rstest run -c ./rstest.config.ts tests/rsc-route-transforms.test.ts`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/rsc-route-transforms.ts
git commit -m "refactor: share RSC style import predicate"
```

### Task 4: Prerender Diagnostic

**Files:**
- Modify: `src/rsc-prerender.ts:190-206`
- Test: `tests/rsc-prerender.test.ts`

**Interfaces:**
- Consumes: public `runReactRouterRscPrerenderBuild`
- Produces: a single-line error ending at ``path.``

- [ ] **Step 1: Add the failing regression test**

Add a temporary server build whose `fetch` returns `new Response(null, { status: 500 })` for `/about`, invoke `runReactRouterRscPrerenderBuild`, and assert:

```ts
await expect(runReactRouterRscPrerenderBuild(options)).rejects.toThrowError(
  /^Prerender: Received a 500 status code from the RSC server while prerendering the `\/about` path\.$/
);
```

- [ ] **Step 2: Verify the regression fails**

Run: `pnpm exec rstest run -c ./rstest.config.ts tests/rsc-prerender.test.ts`

Expected: FAIL because the current error appends a second `/about` line.

- [ ] **Step 3: Correct the message**

```ts
throw new Error(
  `Prerender: Received a ${response.status} status code from ` +
    `the RSC server while prerendering the \`${pathname}\` path.`
);
```

- [ ] **Step 4: Verify the regression passes**

Run: `pnpm exec rstest run -c ./rstest.config.ts tests/rsc-prerender.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/rsc-prerender.ts tests/rsc-prerender.test.ts
git commit -m "fix: avoid duplicate RSC prerender path"
```

### Task 5: Core Verification

- [ ] **Step 1: Run all core tests**

Run: `pnpm test:core`

Expected: PASS.

- [ ] **Step 2: Run typechecking**

Run: `pnpm typecheck`

Expected: PASS.
