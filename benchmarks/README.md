# Rsbuild React Router Benchmarks

## Node lazy compilation evidence

Build the plugin, then compare the same generated app with
`unstableServerLazyCompilation` disabled and enabled:

```sh
pnpm build
node scripts/benchmark/node-lazy.mjs --iterations 10 --warmup 1
```

This runs alternating eager/lazy pairs for CommonJS and ESM with 100 and 1000
optional modules. Every sample uses a fresh process and fixture; dependency
versions are identical and filesystem caches are not flushed. Measurements cover
server readiness, the complete first SSR response requested immediately after
readiness, launch through that response, five repeat requests, and a second cold
import. Assertions require HTTP 200, real SSR content, and the expected compiled
module counts. Browser hydration is measured separately by the browser verifier.

Use `--format cjs|esm`, `--count 100|1000`, and `--out path.json` for a focused
run. JSON records all samples, warmups, versions, and median/min/max summaries;
the adjacent Markdown report shows medians. The Benchmark workflow's `node_lazy`
dispatch input runs this on a dedicated CI runner after type, core, and two-tab
browser/source-edit checks, then uploads all evidence as `node-lazy-proof`.

This repository uses a focused, shared suite for local regression checks and
pull-request comparisons. It measures a production build and an SSR dev-server
case, then records wall-time samples and medians as JSON.

## Local runs

```sh
pnpm bench
pnpm bench:smoke
```

`pnpm bench` builds the plugin and runs every benchmark case with three measured
iterations and one warmup. It writes `.benchmark/results/local.json` by default.
`pnpm bench:smoke` is the fast one-iteration, no-warmup check.

The local runner accepts `--plugin-root`, `--out`, `--iterations`, `--warmup`,
and repeatable `--case` options. The selected plugin root must already contain
`dist/index.js`.

```sh
pnpm build
node benchmarks/run.mts \
  --plugin-root "$PWD" \
  --out .benchmark/results/local.json \
  --case build-256-ssr
```

The JSON payload has `version: 1`, the resolved `pluginRoot`, and per-case
`samplesMs` and `medianMs` values. Fixture work stays under ignored
`.benchmark/`.

## Pull-request comparisons

The pull-request workflow builds the base and head plugins, runs the same local
suite against each checkout, and writes separate JSON results. It compares them
with `scripts/benchmark/compare.mts`, uploads the inputs and Markdown report,
and creates or updates one benchmark comment on same-repository pull requests.

To compare two local results manually:

```sh
node scripts/benchmark/compare.mts \
  --base /path/to/base.json \
  --head /path/to/head.json \
  --out .benchmark/results/compare
```

The output directory contains `report.json` and `comment.md` with the base,
head, and percentage delta for every shared case.

## CodSpeed

```sh
pnpm bench:codspeed
```

This runs the CPU-heavy production build case through CodSpeed simulation. The
I/O-heavy dev-server case remains in the controlled base/head comparison above;
CPU simulation is not a trustworthy instrument for its file-watcher and HTTP
workload. Set `BENCHMARK_PLUGIN_ROOT` to benchmark a built plugin from another
checkout; omit it to use this repository. `BENCHMARK_WORK_ROOT` can relocate
generated fixture work when needed.

```sh
BENCHMARK_PLUGIN_ROOT=/absolute/path/to/plugin pnpm bench:codspeed
```

The GitHub workflow publishes the simulated build result to CodSpeed. The local
same-run JSON comparison and pull-request report remain the source of record for
both build and dev wall time.
