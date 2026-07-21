# Effect Server Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Effect the orchestration and lifecycle spine for all Node-side plugin and server code while reducing handwritten LOC and preserving build, dev-startup, worker, and runtime performance.

**Architecture:** Create one `ManagedRuntime` per plugin instance. Rsbuild hooks and exported Promise APIs are the only runtime boundaries; internal Node-side workflows return `Effect`. A runtime-owned `PluginScope` service owns dynamically created workers, watchers, timers, background fibers, and dev-server resources. Pure transforms, generated/browser runtime code, and worker entrypoints remain ordinary TypeScript.

**Tech Stack:** TypeScript 5.9, Effect 3.22, Rsbuild/Rspack, Rstest, Playwright, Node `worker_threads`, existing benchmark harness.

## Global Constraints

- Scope is Node-side plugin/server code only. Do not add Effect to browser runtime, generated browser modules, templates shipped to applications, or worker entrypoints.
- `src/parallel-route-transform-worker.ts` and its transitive worker-only hot path remain Effect-free unless a separate benchmark-backed design is approved.
- Effect may own `RouteTransformExecutor` acquisition, supervision, and shutdown in the parent process; `postMessage`, worker task execution, serialization, and worker caches remain plain TypeScript.
- Use direct Effect subpath imports such as `effect/Effect` and `effect/ManagedRuntime`; do not import the `effect` barrel from production source.
- Create one `ManagedRuntime` per `pluginReactRouter(...).setup(api)` invocation. Do not create a runtime per hook, route, transform, request, compiler, or worker.
- Keep pure synchronous helpers pure. Do not wrap string transforms, AST transforms, manifest shaping, cache access, predicates, or object construction in `Effect.sync` unless they cross a lifecycle/error boundary.
- Use `Effect.fn` for reusable Node-side workflows. Do not use `Effect.fnUntraced` unless a benchmark identifies tracing overhead in that exact function.
- Add tagged errors only where callers recover differently. Continue using `Error` for opaque third-party failures when a new error class would only add ceremony.
- Preserve public exports and Promise-returning APIs unless a separate breaking-change decision is approved.
- Production behavior and error messages remain unchanged unless a task explicitly names the intended change.
- Every migration tranche must end with fewer Node-side production LOC than it started with. The complete branch must reduce total tracked handwritten TypeScript/JavaScript LOC, including tests and benchmark support.
- Performance acceptance: no benchmark median may regress by more than 2%; no p95/tail metric, dev readiness, HMR update, worker-enabled build, CPU time, or maximum RSS metric may regress by more than 5%.
- If a tranche misses either LOC or performance gates, revert or redesign that tranche before continuing. Do not defer the regression to final cleanup.
- Keep commits tranche-local and independently green. Never mix browser-runtime changes, dependency upgrades, formatting sweeps, or unrelated refactors into this branch.

---

## Target File Structure

Keep the repository's flat `src/` layout. Do not create an `effect/` directory or split every service into its own file.

- `src/effect-runtime.ts`: error normalization, foreign sync/Promise constructors, `PluginScope`, and the single plugin `ManagedRuntime` factory.
- `src/index.ts`: constructs the plugin runtime, adapts Rsbuild hooks to `runtime.runPromise`, and disposes the runtime from close hooks.
- `src/dev-background-resources.ts`: scoped acquisition of route watchers, lazy-compilation prewarm, and the parent-side transform executor.
- `src/route-watch.ts`: Effect-native watcher lifecycle and serialized rescan workflow.
- `src/dev-runtime-session.ts`: session ownership and close sequencing using Effect primitives.
- `src/dev-runtime-controller.ts`: compiler/runtime orchestration, interruptible delayed work, and cleanup.
- `src/dev-generation.ts`: readiness and generation state transitions using `Deferred` plus an Effect workflow boundary.
- `src/lazy-compilation-prewarm.ts`: interruptible prewarm scheduling owned by the plugin scope.
- `src/parallel-route-transforms.ts`: Promise-based worker dispatch remains; acquisition/close becomes a parent-side scoped resource.
- `src/parallel-route-transform-worker.ts`: unchanged Effect-free worker entrypoint.
- `src/parallel-route-transform-protocol.ts`: unchanged protocol unless benchmark instrumentation requires an additive ready/timing message; default plan does not add one.
- `src/{react-router-config,build-manifest,manifest,prerender-build,rsc-prerender,server-build-resolution,server-utils,dev-runtime-artifacts,typegen}.ts`: internal Effect workflows with Promise adapters only at exported/public edges.
- `tests/effect-runtime.test.ts`: runtime ownership, finalization, interruption, and idempotent disposal.
- Existing subsystem tests: behavior-preserving migration coverage; avoid a parallel Effect-only test suite.

## Acceptance Measurements

Record all artifacts under ignored `.benchmark/effect-server-architecture/`.

```bash
git rev-parse HEAD > .benchmark/effect-server-architecture/base-commit.txt
git status --short > .benchmark/effect-server-architecture/base-status.txt
git ls-files -z '*.ts' '*.tsx' '*.js' '*.mjs' '*.mts' \
  | xargs -0 wc -l \
  > .benchmark/effect-server-architecture/base-total-loc.txt
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 \
  | xargs -0 wc -l \
  > .benchmark/effect-server-architecture/base-src-loc.txt
```

Benchmark commands used before the first code change and after every performance-sensitive tranche:

```bash
pnpm build
node scripts/bench-builds.mts --profile=full --mode=build --iterations=5 --warmup=1 --clean=build --format=both --out=.benchmark/effect-server-architecture/base-full-build
node scripts/bench-builds.mts --profile=large --mode=dev --iterations=5 --warmup=1 --parallel-route-transform=false --format=both --out=.benchmark/effect-server-architecture/base-large-dev-inline
node scripts/bench-builds.mts --profile=large --mode=dev --iterations=5 --warmup=1 --parallel-route-transform=true --format=both --out=.benchmark/effect-server-architecture/base-large-dev-workers
node scripts/bench-builds.mts --profile=full --filter=synthetic-1024-ssr-esm --mode=build --iterations=5 --warmup=1 --parallel-route-transform=false --format=both --out=.benchmark/effect-server-architecture/base-1024-inline
node scripts/bench-builds.mts --profile=full --filter=synthetic-1024-ssr-esm --mode=build --iterations=5 --warmup=1 --parallel-route-transform=true --format=both --out=.benchmark/effect-server-architecture/base-1024-workers
```

The worker-enabled dev run is especially important: current code documents roughly 0.5 seconds of startup/IPC cost on constrained machines. The migration must not load Effect in each worker or increase that cost.

---

### Task 1: Freeze Baselines and Add Architectural Boundary Tests

**Files:**

- Modify: `tests/effect-runtime.test.ts`
- Modify: `tests/parallel-route-transforms.test.ts`
- Test: `tests/effect-runtime.test.ts`
- Test: `tests/parallel-route-transforms.test.ts`

**Interfaces:**

- Consumes: current `runPluginEffect`, `tryPluginPromise`, `createDelayedPluginTask`, `createRouteTransformExecutor`.
- Produces: regression tests that constrain runtime disposal and prohibit Effect imports from the worker entrypoint.

- [ ] **Step 1: Capture the clean baseline**

Run the commands in `Acceptance Measurements` before modifying source. Confirm `base-status.txt` is empty and all five benchmark result sets exist.

Expected: build succeeds; each benchmark directory contains `baseline.json` and `baseline.md`.

- [ ] **Step 2: Add the worker-boundary test**

Add this test to `tests/parallel-route-transforms.test.ts`:

```ts
import { readFile } from 'node:fs/promises';

it('keeps the worker entrypoint Effect-free', async () => {
  const source = await readFile(
    new URL('../src/parallel-route-transform-worker.ts', import.meta.url),
    'utf8'
  );

  expect(source).not.toMatch(/from ['"]effect(?:\/|['"])/);
  expect(source).not.toContain("import('effect");
});
```

This is intentionally a source-boundary test. Bundle verification in Task 9 checks the emitted worker chunk and its transitive imports.

- [ ] **Step 3: Run the boundary test**

Run:

```bash
pnpm rstest run tests/parallel-route-transforms.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit the guardrail**

```bash
git add tests/parallel-route-transforms.test.ts
git commit -m "test: protect worker runtime boundary"
```

---

### Task 2: Introduce the Single Plugin Runtime and Runtime-Owned Scope

**Files:**

- Modify: `src/effect-runtime.ts`
- Modify: `tests/effect-runtime.test.ts`

**Interfaces:**

- Produces: `PluginScope`, `PluginEffectRuntime`, and `createPluginEffectRuntime()`.
- Preserves temporarily: `runPluginEffect`, `tryPluginPromise`, `createDelayedPluginTask` while callers migrate.
- Later tasks consume: `runtime.runPromise`, `runtime.runFork`, `runtime.dispose`, and `PluginScope.acquire`.

- [ ] **Step 1: Write failing lifecycle tests**

Add these tests to `tests/effect-runtime.test.ts`:

```ts
import * as Effect from 'effect/Effect';
import { createPluginEffectRuntime, PluginScope } from '../src/effect-runtime';

it('releases dynamically acquired resources when the runtime is disposed', async () => {
  const events: string[] = [];
  const runtime = createPluginEffectRuntime();

  await runtime.runPromise(
    Effect.gen(function* () {
      const scope = yield* PluginScope;
      return yield* scope.acquire(
        Effect.sync(() => {
          events.push('acquire');
          return 'resource';
        }),
        resource =>
          Effect.sync(() => {
            events.push(`release:${resource}`);
          })
      );
    })
  );

  await runtime.dispose();
  expect(events).toEqual(['acquire', 'release:resource']);
});

it('interrupts supervised fibers and disposes idempotently', async () => {
  let finalized = 0;
  const runtime = createPluginEffectRuntime();

  runtime.runFork(
    Effect.never.pipe(
      Effect.ensuring(
        Effect.sync(() => {
          finalized += 1;
        })
      )
    )
  );

  await Promise.all([runtime.dispose(), runtime.dispose()]);
  expect(finalized).toBe(1);
});
```

- [ ] **Step 2: Verify the tests fail**

```bash
pnpm rstest run tests/effect-runtime.test.ts
```

Expected: FAIL because `PluginScope` and `createPluginEffectRuntime` do not exist.

- [ ] **Step 3: Implement the minimal runtime**

Add direct subpath imports and this runtime model to `src/effect-runtime.ts`:

```ts
import * as Context from 'effect/Context';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import * as Scope from 'effect/Scope';

type Acquire = <A, E, R, R2>(
  acquire: Effect.Effect<A, E, R>,
  release: (resource: A) => Effect.Effect<void, never, R2>
) => Effect.Effect<A, E, R | R2>;

export class PluginScope extends Context.Tag(
  'rsbuild-plugin-react-router/PluginScope'
)<PluginScope, { readonly acquire: Acquire }>() {}

const PluginScopeLive = Layer.scoped(
  PluginScope,
  Effect.gen(function* () {
    const scope = yield* Effect.scope;
    return {
      acquire: (acquire, release) =>
        Effect.acquireRelease(acquire, release).pipe(
          Effect.provideService(Scope.Scope, scope)
        ),
    };
  })
);

export const createPluginEffectRuntime = () => {
  const runtime = ManagedRuntime.make(PluginScopeLive);
  let disposePromise: Promise<void> | undefined;

  return {
    runPromise: runtime.runPromise,
    runFork: runtime.runFork,
    dispose: (): Promise<void> => (disposePromise ??= runtime.dispose()),
  };
};

export type PluginEffectRuntime = ReturnType<typeof createPluginEffectRuntime>;
```

- [ ] **Step 4: Run the runtime tests**

```bash
pnpm rstest run tests/effect-runtime.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 5: Check the tranche LOC direction**

```bash
git diff --numstat -- src/effect-runtime.ts tests/effect-runtime.test.ts
```

This foundation may be temporarily positive. Task 3 must make Tasks 2–3 net-negative in production `src/` LOC before the tranche is accepted.

- [ ] **Step 6: Commit the runtime foundation**

```bash
git add src/effect-runtime.ts tests/effect-runtime.test.ts
git commit -m "refactor: add managed plugin effect runtime"
```

---

### Task 3: Make Rsbuild Hooks the Runtime Boundary

**Files:**

- Modify: `src/index.ts`
- Modify: `src/effect-runtime.ts`
- Modify: `tests/index.test.ts`
- Test: `tests/index.test.ts`
- Test: `tests/effect-runtime.test.ts`

**Interfaces:**

- Consumes: `createPluginEffectRuntime()`.
- Produces: exactly one runtime per plugin setup; idempotent disposal from `onCloseBuild`, `onCloseDevServer`, and `onExit`.
- Constraint: no `ManagedRuntime.make`, `Effect.runPromise`, or `Effect.runFork` outside `src/effect-runtime.ts`.

- [ ] **Step 1: Add a setup/close regression test**

Extend the existing fake Rsbuild API in `tests/index.test.ts` to capture `onCloseBuild`, `onCloseDevServer`, and `onExit`. Add a test with this behavior:

```ts
it('shares one Effect runtime and closes it from every Rsbuild shutdown path', async () => {
  const api = createFakeRsbuildApi();
  await pluginReactRouter().setup(api);

  await Promise.all([
    api.runHook('onCloseBuild'),
    api.runHook('onCloseDevServer'),
    api.runHook('onExit'),
  ]);

  expect(api.errors).toEqual([]);
});
```

Use the test file's existing fake API helpers and naming; do not add a second fake framework.

- [ ] **Step 2: Create the runtime once in `setup(api)`**

At the start of `pluginReactRouter(...).setup(api)`, add:

```ts
const effectRuntime = createPluginEffectRuntime();
const disposeEffectRuntime = (): Promise<void> => effectRuntime.dispose();

api.onCloseBuild(disposeEffectRuntime);
api.onCloseDevServer(disposeEffectRuntime);
api.onExit(disposeEffectRuntime);
```

Register these hooks before any resource-producing hook. Because disposal is idempotent, multiple shutdown paths may race safely.

- [ ] **Step 3: Replace hook-local `runPluginEffect` calls**

Change the `onAfterBuild` callbacks at the current classic and RSC branches from:

```ts
runPluginEffect(tryPluginPromise(() => runBuildWorkflow(...)))
```

to:

```ts
effectRuntime.runPromise(
  tryPluginPromise(() => runBuildWorkflow(...))
)
```

Apply the same rule to every Effect launched directly by `src/index.ts`. Do not create nested runtimes.

- [ ] **Step 4: Add an import-boundary assertion**

Add this assertion to `tests/effect-runtime.test.ts` using `readFile` for the exact production files:

```ts
it('centralizes raw Effect runners in effect-runtime.ts', async () => {
  const files = ['index.ts', 'manifest.ts', 'route-watch.ts'];
  const sources = await Promise.all(
    files.map(file =>
      readFile(new URL(`../src/${file}`, import.meta.url), 'utf8')
    )
  );

  for (const source of sources) {
    expect(source).not.toMatch(/Effect\.run(?:Promise|Fork|Sync)/);
    expect(source).not.toContain('ManagedRuntime.make');
  }
});
```

- [ ] **Step 5: Run focused tests and typecheck**

```bash
pnpm rstest run tests/index.test.ts tests/effect-runtime.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 6: Enforce the first LOC gate**

```bash
git diff HEAD~1 --numstat -- src/effect-runtime.ts src/index.ts
```

Tasks 2–3 together must be net-negative in production lines after removing redundant runner/normalization code. If they are positive, keep `PluginScope` but defer the `index.ts` boundary commit until Task 4 removes more lifecycle code.

- [ ] **Step 7: Commit the boundary**

```bash
git add src/index.ts src/effect-runtime.ts tests/index.test.ts tests/effect-runtime.test.ts
git commit -m "refactor: centralize plugin effect runtime boundary"
```

---

### Task 4: Move Parent-Side Worker Ownership into `PluginScope`

**Files:**

- Modify: `src/parallel-route-transforms.ts`
- Modify: `src/dev-background-resources.ts`
- Modify: `src/index.ts`
- Preserve unchanged: `src/parallel-route-transform-worker.ts`
- Preserve unchanged: `src/parallel-route-transform-protocol.ts`
- Modify: `tests/parallel-route-transforms.test.ts`
- Modify: `tests/index.test.ts`

**Interfaces:**

- Preserves: `RouteTransformExecutor.run(task): Promise<RouteTransformResult>`, `prewarm(): void`, `close(): Promise<void>`.
- Produces: `acquireRouteTransformExecutor(options): Effect.Effect<RouteTransformExecutor, Error, PluginScope>`.
- Worker boundary: no Effect import, runtime, fiber, `Deferred`, `Queue`, `Layer`, or schema decoding inside the worker.

- [ ] **Step 1: Add a scoped executor test**

In `tests/parallel-route-transforms.test.ts`, add:

```ts
it('terminates parent-owned workers when the plugin runtime is disposed', async () => {
  const worker = new FakeRouteTransformWorker();
  const runtime = createPluginEffectRuntime();

  const executor = await runtime.runPromise(
    acquireRouteTransformExecutor({
      createWorker: () => worker,
      parallelRouteTransform: true,
    })
  );

  executor.prewarm();
  await runtime.dispose();

  expect(worker.terminateCalls).toBe(1);
});
```

- [ ] **Step 2: Add the parent-side acquisition function**

In `src/parallel-route-transforms.ts`, keep the worker executor implementation Promise-based and add only the resource boundary:

```ts
export const acquireRouteTransformExecutor = Effect.fn(
  'RouteTransformExecutor.acquire'
)(function* (options: RouteTransformExecutorOptions) {
  const pluginScope = yield* PluginScope;
  return yield* pluginScope.acquire(
    Effect.sync(() => createRouteTransformExecutor(options)),
    executor =>
      tryPluginPromise(() => executor.close()).pipe(
        Effect.catchAll(() => Effect.void)
      )
  );
});
```

Do not rewrite `ParallelRouteTransformExecutor.run`, `#createWorkerState`, pending task maps, message handlers, or worker code to Effect in this task.

- [ ] **Step 3: Remove duplicate worker close registration**

In `src/dev-background-resources.ts`, delete `closeRouteTransformExecutor`, remove it from `closeAll`, and remove `api.onCloseBuild(closeRouteTransformExecutor)`. The executor is now released by `PluginScope` when the runtime closes.

Keep explicit dev-server cleanup only for resources not yet migrated in later tasks.

- [ ] **Step 4: Run worker and index tests**

```bash
pnpm rstest run tests/parallel-route-transforms.test.ts tests/index.test.ts
pnpm typecheck
```

Expected: PASS, including all existing lazy-worker, fallback, cache-affinity, idempotent-close, and in-flight rejection cases.

- [ ] **Step 5: Verify worker output stays Effect-free**

```bash
pnpm build
! rg -n "effect/(Effect|Fiber|Layer|ManagedRuntime|Scope)|from ['\"]effect['\"]" src/parallel-route-transform-worker.ts
! rg -n "effect/(Effect|Fiber|Layer|ManagedRuntime|Scope)" dist | rg "parallel-route-transform-worker"
```

Expected: both negated searches exit successfully with no matches.

- [ ] **Step 6: Run worker-sensitive benchmarks**

Repeat the `large-dev-workers`, `1024-inline`, and `1024-workers` commands with `after-task-4` output paths. Compare using:

```bash
node scripts/compare-benchmarks.mts --before=.benchmark/effect-server-architecture/base-1024-workers/baseline.json --after=.benchmark/effect-server-architecture/after-task-4-1024-workers/baseline.json --benchmark=synthetic-1024-ssr-esm
```

Expected: worker-enabled production build remains faster than inline; all acceptance thresholds pass.

- [ ] **Step 7: Enforce LOC and commit**

```bash
git diff --numstat -- src/parallel-route-transforms.ts src/dev-background-resources.ts src/index.ts
git add src/parallel-route-transforms.ts src/dev-background-resources.ts src/index.ts tests/parallel-route-transforms.test.ts tests/index.test.ts
git commit -m "refactor: scope parent route transform workers"
```

---

### Task 5: Replace Manual Dev Background Cleanup with Scoped Effects

**Files:**

- Modify: `src/dev-background-resources.ts`
- Modify: `src/route-watch.ts`
- Modify: `src/lazy-compilation-prewarm.ts`
- Modify: `src/effect-runtime.ts`
- Modify: `tests/route-watch.test.ts`
- Modify: `tests/lazy-compilation-prewarm.test.ts`
- Modify: `tests/effect-runtime.test.ts`

**Interfaces:**

- Produces: `acquireRouteTopologyWatcher(...)` and `acquireLazyCompilationPrewarm(...)` requiring `PluginScope`.
- Preserves: returned `setManifest(manifest)` controller method.
- Deletes: `closeAll`, `routeTopologyWatcherClosed`, `closeActiveRouteTopologyWatcher`, manual cancel/close aggregation, and duplicate watcher-close loops where interruption/finalizers make them unnecessary.

- [ ] **Step 1: Strengthen the existing cancellation and finalization tests**

In `tests/route-watch.test.ts`, extend `does not recreate watchers or touch the marker after close`. After its first `await closePromise`, call the returned close function again and tighten the existing assertion:

```ts
await close();
expect(closeWatcher).toHaveBeenCalledTimes(1);
```

In `tests/lazy-compilation-prewarm.test.ts`, migrate `reschedules in-flight prewarm work with the latest manifest` to acquire the controller from `createPluginEffectRuntime()`. Replace its finalizer:

```ts
await runPluginEffect(controller.cancelEffect());
```

with:

```ts
await runtime.dispose();
```

Add this test beside it to prove a pending delay is interrupted:

```ts
it('does not fetch after runtime disposal cancels a scheduled prewarm', async () => {
  const config = normalizeLazyCompilationPrewarmOptions(true);
  if (!config) throw new Error('Expected prewarm config.');
  const runtime = createPluginEffectRuntime();
  const fetchSpy = rstest.spyOn(globalThis, 'fetch');
  const controller = await runtime.runPromise(
    acquireLazyCompilationPrewarm({
      config,
      onError: error => {
        throw error;
      },
    })
  );

  controller.setServerOrigin('http://localhost:3000');
  controller.setManifest(createManifest());
  controller.schedule();
  await runtime.dispose();

  expect(fetchSpy).not.toHaveBeenCalled();
  fetchSpy.mockRestore();
});
```

- [ ] **Step 2: Convert watcher creation to a scoped acquisition**

Express watcher ownership as one acquisition and one release:

```ts
export const acquireRouteTopologyWatcher = Effect.fn(
  'RouteTopologyWatcher.acquire'
)(function* (options: CreateRouteTopologyWatcherOptions) {
  const pluginScope = yield* PluginScope;
  return yield* pluginScope.acquire(
    tryPluginPromise(() => createRouteTopologyWatcher(options)),
    close =>
      tryPluginPromise(close).pipe(
        Effect.catchAll(error => Effect.sync(() => options.onError(error)))
      )
  );
});
```

Then simplify `createRouteTopologyWatcher` itself: retain its serialized `rescanQueue` semantics until tests demonstrate `Semaphore.withPermits(1)` or a single consumer fiber can replace it with fewer lines.

- [ ] **Step 3: Replace delayed-task state with an interruptible fiber**

In `src/effect-runtime.ts`, replace `createDelayedPluginTask`'s `version`, `activeFiber`, Promise chaining, and explicit cancellation effect with a runtime-scoped controller:

```ts
export type DelayedPluginTask = {
  readonly schedule: () => void;
  readonly reschedule: () => void;
  readonly cancel: () => Promise<void>;
};

export const createDelayedPluginTask = ({
  runtime,
  delayMs,
  run,
  onError,
}: {
  runtime: PluginEffectRuntime;
  delayMs: number;
  run: () => Effect.Effect<void, Error>;
  onError: (error: Error) => void;
}): DelayedPluginTask => {
  let fiber: ReturnType<PluginEffectRuntime['runFork']> | undefined;

  const cancel = async (): Promise<void> => {
    const active = fiber;
    fiber = undefined;
    if (active) await runtime.runPromise(Fiber.interrupt(active));
  };

  const start = (): void => {
    fiber = runtime.runFork(
      Effect.sleep(Duration.millis(delayMs)).pipe(
        Effect.zipRight(Effect.suspend(run)),
        Effect.catchAll(error => Effect.sync(() => onError(error))),
        Effect.ensuring(Effect.sync(() => (fiber = undefined)))
      )
    );
  };

  return {
    schedule: () => {
      if (!fiber) start();
    },
    reschedule: () => void cancel().then(start, onError),
    cancel,
  };
};
```

Run the existing reschedule race test immediately after this edit. If it fails, discard this controller implementation and implement a single `Ref<Option<Fiber>>` controller instead; the accepted implementation must use either fiber interruption or the old version protocol, never both.

- [ ] **Step 4: Remove background close aggregation**

Refactor `registerReactRouterDevBackgroundResources` so it acquires watcher/prewarm/executor resources through `PluginScope`, registers Rsbuild start/compile hooks, and returns only:

```ts
return {
  setManifest(manifest) {
    lazyCompilationPrewarmController?.setManifest(manifest);
  },
};
```

Delete `closeAll`, all local close functions, `api.onCloseDevServer` cleanup from this module, and `api.onCloseBuild` cleanup. Runtime disposal is the single owner.

- [ ] **Step 5: Run affected tests**

```bash
pnpm rstest run tests/effect-runtime.test.ts tests/route-watch.test.ts tests/lazy-compilation-prewarm.test.ts tests/index.test.ts
pnpm typecheck
```

Expected: PASS. Explicitly verify double close, close during rescan, failed watcher startup, reschedule, and callback-triggered close cases.

- [ ] **Step 6: Run dev startup/HMR benchmarks and enforce LOC**

Repeat both large dev benchmark commands with `after-task-5` output paths. Reject the tranche if readiness or update time exceeds the global thresholds.

```bash
git diff --numstat -- src/effect-runtime.ts src/dev-background-resources.ts src/route-watch.ts src/lazy-compilation-prewarm.ts
```

Expected: production deletions exceed additions across the four files.

- [ ] **Step 7: Commit**

```bash
git add src/effect-runtime.ts src/dev-background-resources.ts src/route-watch.ts src/lazy-compilation-prewarm.ts tests/effect-runtime.test.ts tests/route-watch.test.ts tests/lazy-compilation-prewarm.test.ts tests/index.test.ts
git commit -m "refactor: scope dev background resources"
```

---

### Task 6: Collapse Dev Session, Controller, and Generation State Machines

**Files:**

- Modify: `src/dev-runtime-session.ts`
- Modify: `src/dev-runtime-controller.ts`
- Modify: `src/dev-generation.ts`
- Modify: `src/dev-runtime-compilation.ts`
- Modify: `src/dev-runtime-artifacts.ts`
- Modify: `tests/dev-runtime-controller.test.ts`
- Modify: `tests/dev-generation.test.ts`
- Modify: `tests/dev-generation-multi-entry.test.ts`
- Modify: `tests/dev-runtime.integration.test.ts`

**Interfaces:**

- Preserves: `ReactRouterDevRuntimeController`, `RuntimeBinding`, `createReactRouterDevRuntime`, `loadReactRouterServerBuild` public behavior.
- Produces: Effect-native `open`, `finishAttempt`, `close`, and readiness workflows.
- Deletes: Promise observation objects, duplicate close outcome unions, timer handles, runner calls inside state transitions, and callback error normalization duplicated from `effect-runtime.ts`.

- [ ] **Step 1: Freeze the existing state-transition coverage before refactoring**

Run the existing public-behavior tests that cover the three state families:

```bash
pnpm rstest run tests/dev-runtime-controller.test.ts -t "rejects a fatal child failure and recovers on the next compile"
pnpm rstest run tests/dev-runtime-controller.test.ts -t "requires the active server to close before replacement"
pnpm rstest run tests/dev-runtime-controller.test.ts -t "observes one close promise and rejects replacement until it settles"
pnpm rstest run tests/dev-runtime-controller.test.ts -t "publishes a same-attempt rebuild when node starts before web completes"
```

Expected: PASS. These exercise failure recovery, active-to-closing exclusion, close-promise observation, and ready-to-rebuilding-to-ready behavior through the public controller harness.

- [ ] **Step 2: Make session operations return Effect**

Replace Promise-producing session internals with:

```ts
export type DevRuntimeSessionManager = {
  readonly open: Effect.Effect<RuntimeBinding, Error>;
  readonly close: Effect.Effect<void, never>;
};
```

Use one `Deferred` for close completion and one `Ref` for session state. Callers that still require Promises adapt through the plugin runtime at the Rsbuild/API edge.

- [ ] **Step 3: Replace CSS reload timers with fibers**

In `createReactRouterDevRuntimeController`, replace `scheduledCssAssetOwnershipReload`, `setTimeout`, and both `clearTimeout` branches with a delayed fiber supervised by the plugin runtime. Interruption must be the only cancellation mechanism.

The scheduling body should be structurally equivalent to:

```ts
const scheduleCssReload = Effect.fn(function* () {
  yield* Effect.sleep(Duration.millis(CSS_SOURCE_RELOAD_DELAY_MS));
  yield* reloadCssAssetOwnership;
});
```

- [ ] **Step 4: Keep generation readiness on one `Deferred` abstraction**

`src/dev-generation.ts` already uses `EffectDeferred`. Remove surrounding `runPluginEffect` calls and expose readiness as an Effect inside Node-side workflows:

```ts
const awaitGeneration = (entryName: string) =>
  EffectDeferred.await(state.readiness).pipe(
    Effect.map(generation => selectBuild(generation, entryName))
  );
```

Only `loadReactRouterServerBuild`, the exported Promise API, should call `runtime.runPromise` or an explicit standalone adapter.

- [ ] **Step 5: Convert reusable orchestration functions to `Effect.fn`**

Convert `finishRuntimeAttemptEffect`, `evaluateServerBuildsEffect`, and compilation orchestration functions that already return `Effect` from raw arrow functions/`Effect.gen` wrappers to named `Effect.fn` definitions. Do not convert pure selectors, cache lookups, or manifest shaping.

- [ ] **Step 6: Run the graph-derived affected tests**

```bash
pnpm rstest run tests/dev-runtime-controller.test.ts tests/dev-generation.test.ts tests/dev-generation-multi-entry.test.ts tests/dev-runtime.integration.test.ts tests/index.test.ts
pnpm typecheck
```

- [ ] **Step 7: Run dev performance and LOC gates**

Run large dev inline and worker benchmarks plus the existing HMR/HDR fail-fast suite:

```bash
pnpm test:react-router-framework:failfast
git diff --numstat -- src/dev-runtime-session.ts src/dev-runtime-controller.ts src/dev-generation.ts src/dev-runtime-compilation.ts src/dev-runtime-artifacts.ts
```

Expected: no gate regression; production LOC is net-negative.

- [ ] **Step 8: Commit**

```bash
git add src/dev-runtime-session.ts src/dev-runtime-controller.ts src/dev-generation.ts src/dev-runtime-compilation.ts src/dev-runtime-artifacts.ts tests/dev-runtime-controller.test.ts tests/dev-generation.test.ts tests/dev-generation-multi-entry.test.ts tests/dev-runtime.integration.test.ts
git commit -m "refactor: simplify dev runtime with effect"
```

---

### Task 7: Normalize Config, Manifest, Build, and Prerender Workflows

**Files:**

- Modify: `src/react-router-config.ts`
- Modify: `src/build-manifest.ts`
- Modify: `src/manifest.ts`
- Modify: `src/prerender-build.ts`
- Modify: `src/rsc-prerender.ts`
- Modify: `src/server-build-resolution.ts`
- Modify: `src/server-utils.ts`
- Modify: `src/typegen.ts`
- Modify: `tests/react-router-config.test.ts`
- Modify: `tests/build-manifest.test.ts`
- Modify: `tests/manifest.test.ts`
- Modify: `tests/manifest-split-route-modules.test.ts`
- Modify: `tests/prerender.test.ts`
- Modify: `tests/rsc-prerender.test.ts`
- Modify: `tests/typegen.test.ts`

**Interfaces:**

- Internal functions return `Effect` and compose without crossing to Promise.
- Existing exported Promise functions remain adapters for compatibility.
- Concurrency remains capped with `Effect.forEach(..., { concurrency })`.
- Pure route/manifest transforms remain pure functions.

- [ ] **Step 1: Establish naming and boundary rules**

For each exported pair such as:

```ts
getBuildManifestEffect(...)
getBuildManifest(...): Promise<...>
```

keep the Promise name stable and make the Effect workflow the internal implementation. Remove `Effect` suffixes from private functions where the return type already makes the abstraction obvious; preserve exported names if tests or consumers import them.

- [ ] **Step 2: Convert reusable workflows to `Effect.fn`**

Replace the current wrapper beginning at `src/build-manifest.ts:93`:

```ts
export const getBuildManifestEffect = ({
  reactRouterConfig,
  routes,
  rootDirectory,
}: GetBuildManifestOptions): Effect.Effect<
  BuildManifest | undefined,
  Error,
  never
> =>
  Effect.gen(function* () {
```

with this named wrapper while leaving the statements currently inside the generator unchanged:

```ts
export const getBuildManifestEffect = Effect.fn('BuildManifest.get')(
  function* ({
    reactRouterConfig,
    routes,
    rootDirectory,
  }: GetBuildManifestOptions) {
```

Change the final `});` for the old `Effect.gen` to `});` for `Effect.fn`; no second helper or wrapper is introduced. Apply the same wrapper-only transformation to reusable workflows in the other listed files.

Do not wrap `getAddressableRoutes`, `getRouteBranch`, `createRouteManifestItem`, `normalizeSubResourceIntegrity`, or other pure helpers.

- [ ] **Step 3: Remove nested Promise crossings**

Replace all internal forms of:

```ts
yield* tryPluginPromise(() => promiseAdapter(...));
```

with direct Effect composition:

```ts
yield* effectImplementation(...);
```

The final source search must show `runPluginEffect(` only in explicit exported Promise adapters pending Task 8.

- [ ] **Step 4: Preserve bounded parallelism exactly**

Keep these existing concurrency behaviors:

- preset resolution uses `getCappedPluginConcurrency()`;
- manifest route analysis uses `ROUTE_ANALYSIS_CONCURRENCY` capped by route count;
- server bundle resolution uses the existing capped concurrency;
- prerender paths use the configured prerender concurrency;
- type generation and route analysis do not become unbounded.

Use `Effect.forEach` rather than adding a custom pool abstraction.

- [ ] **Step 5: Preserve request cancellation**

Keep `createBuildRequestEffect` based on `Effect.acquireUseRelease` so interruption aborts its `AbortController`:

```ts
export const createBuildRequestEffect = <T>(
  input: string | URL,
  init: RequestInit | undefined,
  handle: (request: Request) => Promise<T>
): Effect.Effect<T, Error> =>
  Effect.acquireUseRelease(
    Effect.sync(() => new AbortController()),
    controller =>
      tryPluginPromise(() =>
        handle(new Request(input, { ...init, signal: controller.signal }))
      ),
    controller => Effect.sync(() => controller.abort())
  );
```

- [ ] **Step 6: Run the graph-derived build tests**

```bash
pnpm rstest run tests/react-router-config.test.ts tests/build-manifest.test.ts tests/manifest.test.ts tests/manifest-split-route-modules.test.ts tests/manifest-version.test.ts tests/prerender.test.ts tests/rsc-prerender.test.ts tests/typegen.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 7: Run full build benchmarks and LOC gate**

Repeat `full-build`, `1024-inline`, and `1024-workers` benchmarks with `after-task-7` output paths. Verify route analysis and prerender concurrency did not regress.

```bash
git diff --numstat -- src/react-router-config.ts src/build-manifest.ts src/manifest.ts src/prerender-build.ts src/rsc-prerender.ts src/server-build-resolution.ts src/server-utils.ts src/typegen.ts
```

Expected: production LOC is net-negative.

- [ ] **Step 8: Commit**

```bash
git add src/react-router-config.ts src/build-manifest.ts src/manifest.ts src/prerender-build.ts src/rsc-prerender.ts src/server-build-resolution.ts src/server-utils.ts src/typegen.ts tests/react-router-config.test.ts tests/build-manifest.test.ts tests/manifest.test.ts tests/manifest-split-route-modules.test.ts tests/prerender.test.ts tests/rsc-prerender.test.ts tests/typegen.test.ts
git commit -m "refactor: compose server workflows with effect"
```

---

### Task 8: Remove Transitional Runners and Consolidate Error Policy

**Files:**

- Modify: `src/effect-runtime.ts`
- Modify: all remaining Node-side callers reported by `rg "runPluginEffect|Effect\.run" src`
- Modify: `tests/effect-runtime.test.ts`
- Modify: affected subsystem tests from Tasks 5–7

**Interfaces:**

- Deletes: `runPluginEffect` if no public compatibility adapter requires it.
- Retains: `tryPluginPromise`, `normalizeEffectError` only if they eliminate repeated boundary code.
- Produces: one error policy at Promise/Rsbuild boundaries and typed recovery only where behavior differs.

- [ ] **Step 1: Inventory remaining runtime crossings**

```bash
rg -n "runPluginEffect|Effect\.run(?:Promise|PromiseExit|Fork|Sync)|ManagedRuntime\.make" src --glob '*.ts'
```

Expected target after this task:

- `ManagedRuntime.make`, raw `Effect.run*`, and `Cause`/`Exit` normalization appear only in `src/effect-runtime.ts`;
- `runtime.runPromise` appears only in `src/index.ts` and explicit exported Promise adapters;
- no runtime calls appear in worker or browser/generated code.

- [ ] **Step 2: Delete redundant Promise adapters**

Where both Promise and Effect variants are private, delete the Promise variant. Where the Promise function is exported, keep exactly this adapter shape:

```ts
export const publicPromiseApi = (...args: Args): Promise<Result> =>
  runStandaloneEffect(internalEffectApi(...args));
```

Define `runStandaloneEffect` once in `effect-runtime.ts` only if exported non-plugin APIs cannot receive the plugin runtime. Document it as a compatibility boundary, not a second application runtime.

- [ ] **Step 3: Consolidate failure normalization**

Use `runPromiseExit` only inside `effect-runtime.ts` to preserve the current behavior of surfacing typed failures as their original `Error` and squashing defects. Do not convert cancellation into a normal `Error` before cleanup completes.

Keep the existing behavior:

```ts
const normalizeEffectCause = <E>(cause: Cause.Cause<E>): Error => {
  const failure = Cause.failureOption(cause);
  return normalizeEffectError(
    Option.isSome(failure) ? failure.value : Cause.squash(cause)
  );
};
```

- [ ] **Step 4: Remove ceremonial Effect wrappers**

Search for `Effect.sync` bodies that only call pure helpers and inline them outside Effect workflows. Keep `Effect.sync` for mutation, logging, clock reads, controller creation, and foreign synchronous APIs that may throw.

- [ ] **Step 5: Run affected tests and typecheck**

```bash
pnpm rstest run tests/effect-runtime.test.ts tests/index.test.ts tests/dev-runtime-controller.test.ts tests/dev-generation.test.ts tests/route-watch.test.ts tests/parallel-route-transforms.test.ts tests/manifest.test.ts tests/prerender.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 6: Enforce crossing and LOC gates**

```bash
rg -n "Effect\.run(?:Promise|PromiseExit|Fork|Sync)|ManagedRuntime\.make" src --glob '*.ts'
git diff --numstat $(cat .benchmark/effect-server-architecture/base-commit.txt)..HEAD -- src
```

Expected: runner search is limited to `src/effect-runtime.ts`; cumulative production LOC is lower than baseline.

- [ ] **Step 7: Commit**

```bash
git add src tests
git commit -m "refactor: remove transitional effect boundaries"
```

---

### Task 9: Verify Browser and Worker Packaging Boundaries

**Files:**

- Modify: `scripts/test-package-interop.mts`
- Preserve: `src/parallel-route-transform-worker.ts`
- Preserve: browser templates and generated HMR/runtime source

**Interfaces:**

- Production package may bundle or externalize Effect for Node-side plugin execution according to existing Rslib behavior.
- Browser/template/worker outputs must not gain Effect imports or runtime code.

- [ ] **Step 1: Build and inventory emitted Effect references**

```bash
pnpm build
rg -n "effect/(Effect|Fiber|Layer|ManagedRuntime|Scope)|from ['\"]effect['\"]" dist
```

Classify every hit by emitted entry/chunk. Accept hits only in Node-side plugin chunks. Any hit reachable from `templates/entry.client`, generated HMR code, RSC client entry, or `parallel-route-transform-worker` fails the task.

- [ ] **Step 2: Add package-boundary assertions**

Extend `scripts/test-package-interop.mts` to discover emitted browser/worker files and assert:

```ts
const emittedFiles = await readdir(distDir, {
  recursive: true,
  withFileTypes: true,
});
const browserAndWorkerOutputs = emittedFiles
  .filter(entry => entry.isFile())
  .map(entry => join(entry.parentPath, entry.name))
  .filter(file =>
    /templates[\\/]entry\.(?:client|rsc\.client)|parallel-route-transform-worker/.test(
      file
    )
  );

for (const relativePath of browserAndWorkerOutputs) {
  const source = await readFile(resolve(distDir, relativePath), 'utf8');
  expect(source).not.toMatch(
    /effect\/(?:Effect|Fiber|Layer|ManagedRuntime|Scope)/
  );
  expect(source).not.toMatch(/from ['"]effect['"]/);
}
```

Use Node's `assert.doesNotMatch` instead of `expect` if this script uses `node:assert`; follow its existing assertion style. Import `readdir`, `readFile`, `join`, and `resolve` from the same Node modules already used by the script.

- [ ] **Step 3: Run package and browser smoke tests**

```bash
pnpm test:package-interop
pnpm test:react-router-framework:smoke
```

Expected: PASS.

- [ ] **Step 4: Measure package output size**

```bash
du -sk dist > .benchmark/effect-server-architecture/after-dist-size.txt
find dist -type f -print0 | sort -z | xargs -0 wc -c > .benchmark/effect-server-architecture/after-dist-files.txt
```

Compare against a baseline build from the recorded base commit. Reject unexplained worker/browser chunk growth; Node-side plugin growth must be justified by total source/maintenance savings.

- [ ] **Step 5: Commit boundary tests or config fix**

```bash
git add scripts/test-package-interop.mts
git commit -m "test: verify effect packaging boundaries"
```

Skip unchanged paths in `git add`; do not create an empty commit.

---

### Task 10: Final Performance, LOC, Health, and Compatibility Gate

**Files:**

- Verify: all source and tests changed above
- Preserve unchanged: `README.md`
- Do not create: `.changeset/effect-server-architecture.md` because this plan is behavior-compatible

**Interfaces:**

- Delivers: behavior-compatible Node-side architecture with one managed runtime, scoped resources, Effect-free workers/browser code, lower LOC, and accepted performance.

- [ ] **Step 1: Run final source-policy searches**

```bash
rg -n "from ['\"]effect['\"]" src --glob '*.ts'
rg -n "Effect\.run(?:Promise|PromiseExit|Fork|Sync)|ManagedRuntime\.make" src --glob '*.ts'
rg -n "runPluginEffect" src --glob '*.ts'
! rg -n "effect/|ManagedRuntime|Effect\." src/parallel-route-transform-worker.ts src/templates --glob '*.{ts,tsx}'
```

Expected: no production barrel imports; raw runners are centralized; worker/templates are Effect-free.

- [ ] **Step 2: Run the complete test matrix**

```bash
pnpm typecheck
pnpm test:core
pnpm build
pnpm test:package-interop
pnpm test:react-router-framework:failfast
```

Expected: PASS.

- [ ] **Step 3: Run the complete benchmark matrix**

Repeat every command in `Acceptance Measurements` with `final-` output paths. Compare each matching `baseline.json` with `scripts/compare-benchmarks.mts`.

Also run:

```bash
pnpm bench:synthetic-app -- --plugin-root "$PWD" --profile=all --runs=5
```

Expected: every metric satisfies the 2% median/5% tail gates; worker-enabled 1024-route build retains its benefit; constrained dev startup does not absorb additional Effect worker cost.

- [ ] **Step 4: Enforce final LOC gates**

```bash
git ls-files -z '*.ts' '*.tsx' '*.js' '*.mjs' '*.mts' \
  | xargs -0 wc -l \
  > .benchmark/effect-server-architecture/final-total-loc.txt
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 \
  | xargs -0 wc -l \
  > .benchmark/effect-server-architecture/final-src-loc.txt
diff -u .benchmark/effect-server-architecture/base-total-loc.txt .benchmark/effect-server-architecture/final-total-loc.txt || true
diff -u .benchmark/effect-server-architecture/base-src-loc.txt .benchmark/effect-server-architecture/final-src-loc.txt || true
```

Manually compare the final `total` rows. Both tracked handwritten total LOC and `src/` LOC must be lower. Test deletion is allowed only when it removes obsolete adapter-specific coverage and the same behavior remains covered through public APIs.

- [ ] **Step 5: Re-run TraceDecay health and affected-test analysis**

Use `tracedecay_health(details: true, path: "src")`, `tracedecay_diff_context` for every changed source file, and `tracedecay_affected` to confirm no graph-derived tests were omitted.

Acceptance relative to the recorded audit:

- overall source health must not fall below 8,637/10,000;
- acyclicity remains 1.0;
- depth remains 1.0;
- modularity remains at least 0.9565;
- complexity equality must improve or remain within measurement noise;
- no new dependency cycle may involve `effect-runtime.ts`.

- [ ] **Step 6: Review maintainability outcomes**

Confirm all of these are true in the final diff:

- one plugin runtime creation site;
- one runtime disposal policy;
- no duplicated worker/watcher/prewarm cleanup registration;
- no Effect runtime inside worker/browser code;
- no Promise-to-Effect-to-Promise bounce inside internal workflows;
- public Promise APIs preserved;
- fewer manual timer handles, `closed` flags, close promises, and `Promise.allSettled` cleanup aggregators;
- fewer production lines overall.

- [ ] **Step 7: Confirm release documentation remains unchanged**

```bash
git diff --exit-code -- README.md .changeset
```

Expected: exit 0. A behavior or packaging change is outside this plan and requires a separate decision before adding a changeset.

- [ ] **Step 8: Commit final cleanup**

```bash
git add src tests scripts
git commit -m "refactor: complete effect server architecture"
```

Skip unchanged paths. Do not commit `.benchmark/` artifacts.

## Stop Conditions

Stop and redesign the current tranche when any condition occurs:

- Effect is imported by `src/parallel-route-transform-worker.ts` or an emitted worker chunk.
- A runtime is created inside a hook callback, route loop, request handler, worker, or transform.
- Worker-enabled dev readiness, worker-enabled 1024-route build, HMR update latency, CPU, or RSS exceeds the performance thresholds.
- A tranche adds production LOC after removing its superseded implementation.
- Resource cleanup requires both a runtime finalizer and the old manual close-hook path.
- An internal workflow repeatedly crosses Promise/Effect boundaries.
- Browser/template output contains Effect runtime code.
- A public Promise API changes without explicit approval.
- The refactor creates a dependency cycle through `effect-runtime.ts`.

## Commit Sequence

1. `test: protect worker runtime boundary`
2. `refactor: add managed plugin effect runtime`
3. `refactor: centralize plugin effect runtime boundary`
4. `refactor: scope parent route transform workers`
5. `refactor: scope dev background resources`
6. `refactor: simplify dev runtime with effect`
7. `refactor: compose server workflows with effect`
8. `refactor: remove transitional effect boundaries`
9. `test: verify effect packaging boundaries` when files changed
10. `refactor: complete effect server architecture` when final cleanup changed files
