# Rsbuild React Router Benchmarks

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

This runs the same cases through Vitest's benchmark runner. Set
`BENCHMARK_PLUGIN_ROOT` to benchmark a built plugin from another checkout; omit
it to use this repository. `BENCHMARK_WORK_ROOT` can relocate generated fixture
work when needed.

```sh
BENCHMARK_PLUGIN_ROOT=/absolute/path/to/plugin pnpm bench:codspeed
```

The GitHub workflow publishes this wall-time run to CodSpeed when available.
That publication is optional; the local JSON comparison and pull-request report
remain the source of record.
