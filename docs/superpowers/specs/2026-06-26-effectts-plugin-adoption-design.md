# EffectTS Plugin Adoption Design

## Goal

Adopt Effect internally in `rsbuild-plugin-react-router` to make async scheduling, lifecycle cleanup, cancellation, retry, and error propagation easier to reason about without changing public plugin APIs or generated React Router framework code.

## Scope

Effect is allowed inside the plugin implementation and build tooling paths. It must not be emitted into generated React Router framework modules, templates, route code, or public plugin configuration types.

The first implementation seam is the route transform executor in `src/parallel-route-transforms.ts`. It already exposes a Promise-shaped `RouteTransformExecutor` with `run()` and `close()`, which makes it possible to migrate internal scheduling while keeping callers unchanged.

Later seams can build on the same internal patterns:

- `src/dev-runtime-controller.ts` and `src/dev-generation.ts` for compiler attempt coordination, invalidation, retry-node scheduling, and stale evaluation cancellation.
- `src/prerender-build.ts` for bounded prerender concurrency and fail-fast semantics.
- Small config/preset hooks only when structured error aggregation is clearly useful.

## Non-Goals

- Do not expose Effect types through `PluginOptions`, `RouteTransformExecutor`, or `loadReactRouterServerBuild`.
- Do not import Effect from `src/templates/*`.
- Do not import Effect from generated virtual React Router modules.
- Do not migrate `src/parallel-route-transform-worker.ts` in the first step; keep worker startup and per-task payloads lean.
- Do not rewrite the whole plugin setup function in one pass.

## Architecture

Add `effect` as a runtime dependency and introduce a small internal adapter module for converting Effect computations back to Promises at Rsbuild/plugin boundaries. The plugin remains Promise-native externally, but internal resources can use Effect concepts where they simplify state:

- `Effect.tryPromise` for worker termination and Promise-returning boundaries.
- `Effect.runPromise` for preserving the existing async API surface.
- `Effect.all` for deterministic close cleanup over worker resources.
- Typed internal helpers for normalizing unknown causes into `Error`.

The first migration keeps the existing `ParallelRouteTransformExecutor` class and replaces manual Promise orchestration in `close()` with Effect-backed cleanup. That is intentionally conservative: it proves dependency, build, type, and test compatibility before moving more subtle lifecycle code.

## Route Transform Executor Behavior To Preserve

- `parallelRouteTransform: false` runs all tasks inline.
- Invalid explicit worker counts throw the same validation error.
- Worker startup errors disable workers and fall back to inline execution for later tasks.
- Route transform task errors propagate normally.
- `close()` is idempotent.
- `close()` rejects in-flight worker tasks before terminating workers.
- `run()` after `close()` executes inline.
- A failed `postMessage` clears that worker's source cache entry so the next request for the same route sends full source again.

## Test Plan

Add focused tests in `tests/parallel-route-transforms.test.ts` for executor lifecycle behavior before changing implementation:

- `close()` can be called more than once and still allows later inline execution.
- `close()` rejects in-flight tasks.
- A `postMessage` failure clears source cache and the next request sends full code.

Keep existing tests green:

- `corepack pnpm run test:core`
- `corepack pnpm exec tsc --noEmit`
- `corepack pnpm run format:check`
- `corepack pnpm run build`
- `corepack pnpm run test:package-interop`

## Rollout

1. Commit this spec and implementation plan.
2. Add `effect` and the internal Promise boundary helper.
3. Add failing lifecycle tests around route transform executor cleanup.
4. Migrate route transform executor cleanup to Effect internally.
5. Verify the existing suite and package interop.
6. Open a draft PR stacked on the parallel dev compiler PR.

## Risks

Effect adds a real runtime dependency. That is acceptable only if it stays internal and removes enough scheduling complexity over the staged rollout. The first step is intentionally small so the PR proves integration cost before attempting dev-runtime migration.

The dev runtime remains the highest-value target, but it has subtle Rsbuild timing behavior. It should be migrated only after the route transform executor establishes a tested internal Effect pattern.
