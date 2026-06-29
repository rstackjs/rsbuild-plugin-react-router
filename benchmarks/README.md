# Rsbuild React Router Performance Baselines

This directory documents the repeatable benchmark workflow for
`rsbuild-plugin-react-router`. Benchmark artifacts are written to `.benchmark/`,
which is intentionally ignored.

## Commands

```sh
pnpm bench:smoke
pnpm bench:baseline
pnpm bench:full
pnpm bench:large
```

`bench:smoke` is a one-iteration sanity check. `bench:baseline` is the default
comparison point for plugin performance work. CI compares the `large` profile in
dev mode, which measures both compiler readiness and representative route loads
after the dev server is ready. `bench:full` adds larger route counts.
`bench:large` runs a 355-route synthetic app with a broad source graph:
generated modules, dynamic imports, workers, SVG assets, CSS modules, and large
public locale payloads.

All benchmark profiles generate deterministic synthetic React Router apps under
`.benchmark/fixtures/`, build the current plugin package once, then run Rsbuild
builds with plugin performance instrumentation disabled by default. Pass
`--log-performance` when you need diagnostic `[react-router:performance]`
operation reports.

Pass `--mode dev` to measure dev-server startup readiness instead of production
builds:

```sh
node scripts/bench-builds.mjs --profile=large --mode=dev --iterations=5 --warmup=0
```

Dev mode starts `rsbuild dev`, waits for the required compilers to print ready
messages, then fetches representative routes before terminating the server. The
JSON and markdown reports separate compiler `readyMs`, post-ready
`routeTotalMs`, and total wall time. GNU time CPU/RSS collection and Rspack
profile capture are build-mode features.

By default, dev mode requests `/`, a stable sample of generated route paths, and
the last route in the fixture. Use `--dev-routes=none` for readiness-only
startup measurements, or pass a comma-separated list of route indexes or paths:

```sh
node scripts/bench-builds.mjs --profile=large --mode=dev --dev-routes=0,1,10,200
node scripts/bench-builds.mjs --profile=large --mode=dev --dev-routes=/,/route-0001
```

Numeric route indexes are ordinal benchmark positions: `0` is `/`, and `1` is
the first non-index generated route for that fixture.

Route requests automatically add `--experimental-vm-modules` to `NODE_OPTIONS`
for SSR ESM evaluation.

To capture Rspack tracing output for a benchmark, pass `--rspack-profile`:

```sh
node scripts/bench-builds.mjs --profile=smoke --iterations=1 --warmup=0 --rspack-profile=OVERVIEW
node scripts/bench-builds.mjs --profile=full --filter=synthetic-1024 --iterations=1 --warmup=0 --rspack-profile=ALL
```

Trace directories are moved from fixture roots into
`.benchmark/results/<profile>/rspack-profiles/` and referenced from the JSON
result. `ALL` can produce large traces; use it for targeted runs.
When `--rspack-trace-output` is provided, the benchmark writes one absolute
trace file per run under that directory so Rsbuild does not resolve the path
inside each generated `.rspack-profile-*` directory.

To capture Rspack tracing output for a benchmark, pass `--rspack-profile`:

```sh
node scripts/bench-builds.mjs --profile=smoke --iterations=1 --warmup=0 --rspack-profile=OVERVIEW
node scripts/bench-builds.mjs --profile=full --filter=synthetic-1024 --iterations=1 --warmup=0 --rspack-profile=ALL
```

Trace directories are moved from fixture roots into
`.benchmark/results/<profile>/rspack-profiles/` and referenced from the JSON
result. `ALL` can produce large traces; use it for targeted runs.
When `--rspack-trace-output` is provided, the benchmark writes one absolute
trace file per run under that directory so Rsbuild does not resolve the path
inside each generated `.rspack-profile-*` directory.

## Baseline Shape

The synthetic fixture keeps app behavior simple and scales route count/export
shape deliberately:

- `ssr-esm`: production SSR build with ESM server output.
- `ssr-esm-split`: same route set with `future.v8_splitRouteModules`.
- `spa`: `ssr: false` route transform path.
- `sourcemaps`: production client sourcemaps enabled.

Routes include plain components, server data exports, client data exports,
split-route candidates, and `.client` / `.server` imports. This targets the
plugin paths that are expensive in large apps: per-route client entries,
`?react-router-route` transforms, client-only stubbing, split-route detection,
and manifest emission.

The `large` profile keeps those plugin paths but stresses a wider source graph
instead of only scaling route count.

## Outputs

Each run writes:

- `.benchmark/results/<profile>/baseline.json`
- `.benchmark/results/<profile>/baseline.md`

The JSON includes wall time, dev-mode readiness and route request timings, and
optional GNU `/usr/bin/time -v` user/sys/RSS data. Diagnostic runs with
`--log-performance` also include parsed
`[react-router:performance]` reports from the plugin and an aggregated
`pluginOperations` table per fixture. The markdown report includes the same
operation breakdown when instrumentation is enabled so route transforms and
manifest work can be compared without opening the raw JSON.

## Hygiene

Start and end with:

```sh
git status --short
```

Benchmark output should stay inside ignored `.benchmark/`. If you need to clean
generated benchmark data, remove `.benchmark/` directly rather than using a broad
`git clean -fdX`, which can also delete `node_modules/` and TraceDecay indexes.
