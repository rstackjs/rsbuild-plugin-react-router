# Rsbuild React Router Performance Baselines

This directory documents the repeatable benchmark workflow for
`rsbuild-plugin-react-router`. Benchmark artifacts are written to `.benchmark/`,
which is intentionally ignored.

## Commands

```sh
pnpm bench:smoke
pnpm bench:baseline
pnpm bench:full
```

`bench:smoke` is a one-iteration sanity check. `bench:baseline` is the default
comparison point for plugin performance work. `bench:full` adds larger route
counts for stress testing.

All benchmark profiles generate deterministic synthetic React Router apps under
`.benchmark/fixtures/`, build the current plugin package once, then run Rsbuild
builds with `pluginReactRouter({ logPerformance: true })`.

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

## Outputs

Each run writes:

- `.benchmark/results/<profile>/baseline.json`
- `.benchmark/results/<profile>/baseline.md`

The JSON includes wall time, optional GNU `/usr/bin/time -v` user/sys/RSS data,
parsed `[react-router:performance]` reports from the plugin, and an aggregated
`pluginOperations` table per fixture. The markdown report includes the same
operation breakdown so route transforms and manifest work can be compared
without opening the raw JSON.

## Hygiene

Start and end with:

```sh
git status --short
```

Benchmark output should stay inside ignored `.benchmark/`. If you need to clean
generated benchmark data, remove `.benchmark/` directly rather than using a broad
`git clean -fdX`, which can also delete `node_modules/` and TraceDecay indexes.
