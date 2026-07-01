# Thermo Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the thermo-nuclear review findings by deleting duplicated orchestration, narrowing public/internal boundaries, and preserving the branch's dev-start performance work.

**Architecture:** Keep `src/index.ts` as plugin wiring, move dev background resource lifecycle into a focused module, and keep Effect at runtime edges where cancellation/finalization actually helps. Make dev compile coherence an explicit coordinator contract instead of scattered nullable fields.

**Tech Stack:** TypeScript, Rsbuild/Rspack plugin hooks, Effect only at plugin lifecycle boundaries, Rstest, pnpm benchmarks.

---

### Task 1: Collapse Delayed And Debounced Task Scheduling

**Files:**

- Modify: `src/effect-runtime.ts`
- Modify: `src/route-watch.ts`
- Test: `tests/effect-runtime.test.ts`
- Test: `tests/route-watch.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests that describe a shared delayed task primitive with both `schedule()` and `reschedule()` semantics:

```ts
it('reschedules a delayed plugin task by replacing the pending run', async () => {
  let runs = 0;
  const task = createDelayedPluginTask({
    delayMs: 10,
    run: () =>
      Effect.sync(() => {
        runs += 1;
      }),
    onError(error) {
      throw error;
    },
  });

  task.schedule();
  task.reschedule();
  await vi.waitFor(() => expect(runs).toBe(1));
});
```

- [ ] **Step 2: Verify the test fails**

Run: `pnpm test:core tests/effect-runtime.test.ts tests/route-watch.test.ts`

Expected: fail because `reschedule` does not exist.

- [ ] **Step 3: Implement the shared primitive**

Extend `createDelayedPluginTask` with `reschedule()` that cancels the pending fiber and starts a replacement. Keep `schedule()` idempotent for current callers.

- [ ] **Step 4: Replace route-watch custom scheduler**

Remove `scheduledRescanFiber` and `scheduledRescanToken` from `src/route-watch.ts`. Use the shared task to debounce rescans and cancel on close.

- [ ] **Step 5: Verify**

Run: `pnpm test:core tests/effect-runtime.test.ts tests/route-watch.test.ts`.

### Task 2: Extract Dev Background Lifecycle From Plugin Setup

**Files:**

- Create: `src/dev-background-resources.ts`
- Modify: `src/index.ts`
- Test: `tests/index.test.ts`

- [ ] **Step 1: Write failing wiring tests**

Add a test that dev setup still registers the same close and dev compile hooks while keeping lazy prewarm enabled:

```ts
it('registers dev background resources through the plugin lifecycle', async () => {
  const rsbuild = await createStubRsbuild({ rsbuildConfig: {} });
  rsbuild.addPlugins([
    pluginReactRouter({ lazyCompilation: true, lazyCompilationPrewarm: true }),
  ]);
  await rsbuild.unwrapConfig();

  expect(rsbuild.onAfterStartDevServer).toHaveBeenCalled();
  expect(rsbuild.onAfterDevCompile).toHaveBeenCalled();
  expect(rsbuild.onCloseDevServer).toHaveBeenCalled();
});
```

- [ ] **Step 2: Verify the test passes before refactor**

Run: `pnpm test:core tests/index.test.ts`.

Expected: pass. This is a characterization test for behavior-preserving extraction.

- [ ] **Step 3: Extract the lifecycle module**

Move route topology watcher scheduling, lazy compilation prewarm controller setup, route transform prewarm, and close aggregation into `registerReactRouterDevBackgroundResources`. Pass only stable inputs from `index.ts`.

- [ ] **Step 4: Verify index shrinks and behavior holds**

Run: `wc -l src/index.ts` and `pnpm test:core tests/index.test.ts tests/lazy-compilation-prewarm.test.ts tests/route-watch.test.ts`.

Expected: `src/index.ts` is below its current 1164 lines and tests pass.

### Task 3: Make Dev Compile Attempts Explicit

**Files:**

- Modify: `src/dev-runtime-compilation.ts`
- Modify: `src/dev-runtime-controller.ts`
- Modify: `src/dev-generation.ts`
- Modify: `src/dev-runtime-artifacts.ts`
- Test: `tests/dev-runtime-controller.test.ts`
- Test: `tests/dev-generation.test.ts`

- [ ] **Step 1: Add failing/coherence tests**

Add or tighten tests that mixed web/node compiler cycles are rejected unless both sides carry the same explicit attempt token.

- [ ] **Step 2: Verify red**

Run: `pnpm test:core tests/dev-runtime-controller.test.ts tests/dev-generation.test.ts`.

Expected: the new test fails against the current scattered optional token model.

- [ ] **Step 3: Introduce an attempt coordinator**

Create a small coordinator in `src/dev-runtime-compilation.ts` that returns an opaque attempt token from `beginAttempt()` and owns `started`, `completed`, `settled`, and `failed` bookkeeping.

- [ ] **Step 4: Remove fake MultiStats boundary**

Change runtime finish input to an explicit dev result shape instead of casting `{ stats: [web, node] } as Rspack.MultiStats`.

- [ ] **Step 5: Verify**

Run: `pnpm test:core tests/dev-runtime-controller.test.ts tests/dev-generation.test.ts tests/dev-runtime.integration.test.ts`.

### Task 4: Box Rspack Lazy-Compilation Internals

**Files:**

- Modify: `src/lazy-compilation-prewarm.ts`
- Modify: `src/types.ts`
- Test: `tests/lazy-compilation-prewarm.test.ts`
- Test: `tests/index.test.ts`

- [ ] **Step 1: Write adapter tests**

Add tests for a named `RspackLazyCompilationTriggerClient`/adapter that parses emitted proxy keys and tries trigger candidates.

- [ ] **Step 2: Verify red**

Run: `pnpm test:core tests/lazy-compilation-prewarm.test.ts tests/index.test.ts`.

Expected: fail because the adapter boundary does not exist.

- [ ] **Step 3: Extract adapter and narrow public options**

Keep internal trigger prefix and route caps private unless tests prove a public option is needed. Prefer `lazyCompilationPrewarm?: boolean` in `PluginOptions`.

- [ ] **Step 4: Verify**

Run: `pnpm test:core tests/lazy-compilation-prewarm.test.ts tests/index.test.ts`.

### Task 5: Replace Weak Script Indirection With Real Benchmark Orchestration

**Files:**

- Delete: `scripts/script-effect.mts`
- Modify: `scripts/bench-builds.mts`
- Modify: `scripts/compare-benchmarks.mts`
- Modify: `scripts/report-benchmark-ci.mts`
- Modify: `scripts/test-package-interop.mts`
- Delete: `tsconfig.scripts.json`
- Modify: `package.json`
- Modify: `.github/workflows/e2e-tests.yml`

- [ ] **Step 1: Confirm the script gate is misleading**

Run: `pnpm exec tsc -p tsconfig.scripts.json --strict --noUnusedLocals --noUnusedParameters --pretty false`.

Expected: fail with implicit `any` and untyped `.mjs` imports.

- [ ] **Step 2: Replace Effect CLI wrappers**

Delete the shared wrapper that only lifts `main()` into Effect. Keep simple assertion/report scripts as direct async CLIs, and use Effect directly in `bench-builds.mts` for benchmark-suite setup, sequential run orchestration, fail-fast exit status, and result collection.

- [ ] **Step 3: Remove the weak script typecheck gate**

Delete `tsconfig.scripts.json`, remove `typecheck:scripts`, and remove the CI step that claimed to typecheck scripts while allowing broad `any`.

- [ ] **Step 4: Fix benchmark cache invalidation**

If a shared script helper remains, include it in `.github/workflows/benchmark.yml` cache hashing. If the helper is deleted, no cache-key change is needed for it.

- [ ] **Step 5: Verify**

Run: `pnpm test:package-interop`.

### Task 6: Final Simplification And Performance Verification

**Files:**

- Modify only files changed by Tasks 1-5.

- [ ] **Step 1: Run simplify pass**

Review the diff for pass-through wrappers, repeated conditionals, unnecessary casts, and one-off helpers. Delete complexity where behavior stays the same.

- [ ] **Step 2: Run verification stack**

Run:

```bash
pnpm format:check
pnpm build
pnpm test:core
pnpm test:package-interop
pnpm bench:smoke
git diff --check
```

- [ ] **Step 3: Compare file-size and complexity evidence**

Run:

```bash
wc -l src/index.ts src/route-watch.ts src/dev-runtime-controller.ts src/lazy-compilation-prewarm.ts scripts/bench-builds.mts
rg -n " as Rspack.MultiStats|currentAttemptIdentity|script-effect|concurrency: 'unbounded'" src scripts tests
```

Expected: review findings are either removed or explicitly justified.
