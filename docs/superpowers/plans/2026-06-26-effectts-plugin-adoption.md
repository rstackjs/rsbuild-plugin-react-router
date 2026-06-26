# EffectTS Plugin Adoption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first internal Effect-backed scheduling seam to the route transform executor while preserving public Promise APIs and existing React Router generated output.

**Architecture:** Effect is introduced as an internal runtime dependency. The first migration keeps the `RouteTransformExecutor` interface stable and uses Effect behind `close()` cleanup and Promise boundaries, leaving worker-side code untouched.

**Tech Stack:** TypeScript, Rsbuild/Rspack, Rstest, pnpm, Effect 3.x.

---

## Files

- Create: `docs/superpowers/specs/2026-06-26-effectts-plugin-adoption-design.md`
- Create: `docs/superpowers/plans/2026-06-26-effectts-plugin-adoption.md`
- Create: `src/effect-runtime.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `src/parallel-route-transforms.ts`
- Modify: `tests/parallel-route-transforms.test.ts`

## Task 1: Add Design And Plan Artifacts

- [ ] **Step 1: Write the design spec**

Create `docs/superpowers/specs/2026-06-26-effectts-plugin-adoption-design.md` with the architecture, non-goals, rollout, and test plan.

- [ ] **Step 2: Write this implementation plan**

Create `docs/superpowers/plans/2026-06-26-effectts-plugin-adoption.md` with task-by-task implementation steps.

- [ ] **Step 3: Commit docs**

Run:

```bash
git add docs/superpowers/specs/2026-06-26-effectts-plugin-adoption-design.md docs/superpowers/plans/2026-06-26-effectts-plugin-adoption.md
git commit -m "docs: plan effect adoption"
```

## Task 2: Add Lifecycle Tests

- [ ] **Step 1: Add tests before production code**

Add tests to `tests/parallel-route-transforms.test.ts` covering:

- `close()` rejects an in-flight worker task.
- `close()` is idempotent and `run()` after close falls back inline.
- A `postMessage` failure clears the source cache so the next request sends full source.

- [ ] **Step 2: Run focused tests and verify the new postMessage test fails**

Run:

```bash
corepack pnpm exec rstest run -c ./rstest.config.ts tests/parallel-route-transforms.test.ts
```

Expected: the source-cache clearing test fails until the worker factory test seam and implementation are added.

## Task 3: Add Effect Dependency And Boundary Helper

- [ ] **Step 1: Add Effect dependency**

Run:

```bash
corepack pnpm add effect
```

- [ ] **Step 2: Add `src/effect-runtime.ts`**

Create a small internal helper that exports:

```ts
import { Effect } from 'effect';

export const runPluginEffect = <A, E>(
  effect: Effect.Effect<A, E, never>
): Promise<A> => Effect.runPromise(effect);

export const normalizeEffectError = (cause: unknown): Error =>
  cause instanceof Error ? cause : new Error(String(cause));
```

## Task 4: Migrate Route Transform Executor Cleanup

- [ ] **Step 1: Add a worker factory test seam**

Keep `createRouteTransformExecutor()` unchanged for callers. Add an internal exported test helper that accepts a worker factory and delegates to the same implementation.

- [ ] **Step 2: Use Effect inside `close()`**

Replace manual `Promise.all(workers.map(...terminate...))` cleanup with an Effect program that rejects pending tasks, clears maps, terminates workers, and returns through `runPluginEffect`.

- [ ] **Step 3: Preserve behavior**

Keep inline fallback after close, worker startup fallback, transform error propagation, and source-cache invalidation on `postMessage` failure.

## Task 5: Verify And Publish

- [ ] **Step 1: Run focused tests**

```bash
corepack pnpm exec rstest run -c ./rstest.config.ts tests/parallel-route-transforms.test.ts
```

- [ ] **Step 2: Run full verification**

```bash
corepack pnpm run test:core
corepack pnpm exec tsc --noEmit
corepack pnpm run format:check
corepack pnpm run build
corepack pnpm run test:package-interop
git diff --check
```

- [ ] **Step 3: Commit implementation**

```bash
git add package.json pnpm-lock.yaml src/effect-runtime.ts src/parallel-route-transforms.ts tests/parallel-route-transforms.test.ts
git commit -m "feat: use effect for transform executor cleanup"
```

- [ ] **Step 4: Push and open a draft PR**

```bash
git push -u origin codex/effectts-scheduling
gh pr create --draft --base codex/parallel-dev-compilers --head codex/effectts-scheduling
```
