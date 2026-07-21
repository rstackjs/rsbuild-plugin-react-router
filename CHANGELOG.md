# rsbuild-plugin-react-router

## 0.4.0

### Minor Changes

- 2c155f2: Add state-preserving Hot Module Replacement for route modules in development: route updates now apply React Refresh registration and in-place route patching instead of triggering a full page reload. Server code changes also trigger hot data revalidation, so loader data refreshes without a reload. This degrades gracefully to the previous full-reload behavior when `@rsbuild/plugin-react` isn't present or Fast Refresh is disabled.

### Patch Changes

- 2c155f2: Align the Fast Refresh registration backfill with react-refresh's own
  component-detection rules so `memo`/`forwardRef` components in pre-lowered
  (MDX) routes register for HMR. Multi-declarator lists, curried arrows, and
  require/import interop callees no longer produce false registrations.
- 96ed301: Export `ReactRouterRsbuildConfig`, the plugin's typed `react-router.config.*`
  shape (React Router's `Config` plus plugin-supported options such as
  `splitRouteModules`), so projects no longer need to import types from
  `@react-router/dev/config` or hand-roll intersections. `@react-router/dev`
  is declared as an optional peer dependency since the exported config and
  route types resolve from it; this is not a breaking change — nothing new is
  required at install or runtime.
- 35a2036: Prerender fixes: root route data now flows through the legacy handler path,
  and the dynamic/splat prerender warning strips the leading slash only for
  top-level dynamic segments so nested paths are reported correctly.

## 0.3.1

### Patch Changes

- fde856e: Improve development startup performance with guarded lazy compilation enabled by default, configurable route transform workers, unstable opt-in lazy-compilation prewarming, and leaner dev build orchestration.
- 18fb279: Migrate the dev middleware hook from `dev.setupMiddlewares` to `server.setup`.
- 9e95ea0: Serve the React Router SPA shell during `rsbuild dev` when `ssr` is disabled.
- a512cc2: Preserve React Router manifest assets when Rspack natural chunk or module ids make direct chunk lookup incomplete.
- 4aff046: Fix route export analysis for valid TypeScript route modules that Yuku cannot parse, and preserve literal browser manifest replacement values containing `$`.

## 0.3.0

### Minor Changes

- 95874ff: Keep development SSR requests on the last successfully evaluated atomic set of
  React Router server entries and their paired web manifests, and expose
  `loadReactRouterServerBuild` so custom servers use the same last-good pair.
  Expose `resolveReactRouterServerBuild` to normalize ESM and CommonJS production
  server modules through the same validated build boundary.
  Preserve `serverBundles` through config normalization and publish every
  configured bundle atomically with its exact filtered manifest.
  This does not snapshot deferred server chunks, make emitted client assets
  atomic, or delay Rsbuild's WebSocket success notification.
- 31e5bf5: Expose a plugin-level `lazyCompilation` option that keeps React Router hydration
  modules eager while preserving user lazy compilation filters.

### Patch Changes

- 95874ff: Improve route analysis and route chunking performance for larger applications, with benchmark tooling to track build overhead.
- 9352787: Reload the dev server when local helper modules imported by React Router config change.
- 95874ff: Keep React Router hydration entries compatible with Rsbuild lazy compilation when `entries: true` is enabled.
- 3f6db5c: Preserve mixed asset query semantics for `?url&raw` and `?url&inline` requests.
- c4b6d8b: Simplify the README configuration docs and stabilize `parallelRouteTransform` so `true` forces the default worker count, a positive integer sets the worker count, and `false` disables worker-thread route transforms.
- 95874ff: Preserve route topology declaration order during development so reordering route
  entries is detected as a topology change.
- 95874ff: Harden route module transforms and development route watching so source maps,
  server/client-only modules, and route topology restarts behave consistently.
- 61f451e: Support React Router's stable `prerender.concurrency` config while preserving
  the existing `unstable_concurrency` fallback.
- 0287c14: Support React Router's stable `subResourceIntegrity` config and keep it in sync
  with `future.unstable_subResourceIntegrity` when merging presets and user
  configuration.
- 95874ff: Avoid duplicate startup route topology scans and tighten development watcher
  lifecycle handling for route additions and removals.

## 0.2.0

### Minor Changes

- fc02b96: Add support for Rsbuild 2 and update the Rsbuild/Rspack toolchain.

## 0.1.1

### Patch Changes

- f6691e1: Enable Rspack HMR for ESM server outputs by not forcing `dev.hmr=false` in the React Router plugin.
- 4b933d0: Use `@remix-run/node-fetch-server` for the built-in dev server middleware to reduce direct reliance on `@mjackson/node-fetch-server`.

## 0.1.0

### Minor Changes

- 3c6d368: Bring Rsbuild plugin behavior closer to React Router's official Vite plugin.
  - Add React Router config resolution + validations/warnings for closer framework parity
  - Add split route modules (route chunk entrypoints) including enforce mode validation
  - Improve `.client` module stubbing on the server (including `export *` re-exports)
  - Improve manifest generation: stable fingerprinted build manifests, bundle-specific server manifests, and optional Subresource Integrity (`future.unstable_subResourceIntegrity`)
  - Improve Module Federation support by relying on Rspack `experiments.asyncStartup` (without overriding explicit CommonJS server output)

## 0.0.5

### Patch Changes

- 797b401: Fix: Correctly expose routeDiscovery configuration for React Router v7 in Rspack builds.

## 0.0.4

### Patch Changes

- 88b052d: do not set target when output is esm

## 0.0.3

### Patch Changes

- 8928f7b: search for routes file with any extention
- 8928f7b: support multiple extentions for routes file, like js,ts,jsx etc

## 0.0.2

### Patch Changes

- 53722e4: remove logs from module proxy

## 0.0.1

### Patch Changes

- 2aa8f3e: Support React Router
