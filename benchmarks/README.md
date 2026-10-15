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
SSR readiness (initial compilation and runtime loading), the complete first SSR
response requested immediately after readiness, launch through that response,
five repeat requests, and a second cold import. Timed runs use default watcher
settings and disable module-census instrumentation. Assertions require HTTP 200
and real SSR content for every request. Separate native and browser checks verify
compiled-module counts, browser hydration, retained state, and source edits.

Use `--format cjs|esm`, `--count 100|1000`, and `--out path.json` for a focused
run. JSON records all samples, warmups, versions, and median/min/max summaries;
the adjacent Markdown report shows medians. The Benchmark workflow's `node_lazy`
dispatch input runs type and two-tab browser/source-edit checks on Linux and
Windows, the full core suite on Linux, and the affected runtime suite on Windows.
It then measures timings on the dedicated Linux runner. It uploads
the evidence as `node-lazy-proof-ubuntu-latest` and
`node-lazy-proof-windows-latest`.

This repository uses a focused, shared suite for local regression checks and
pull-request comparisons. It measures a production build and an SSR dev-server
case, then records wall-time samples and medians as JSON.

## Issue #155 browser comparison

To measure the milestones requested in issue #155, build both the candidate and
pre-PR checkouts, then run:

```sh
node scripts/benchmark/node-lazy-browser.mjs \
  --stock-repo /absolute/path/to/pre-pr-checkout \
  --iterations 10 --warmup 1
```

The three arms are the pre-PR plugin with its installed stock packages, the
candidate with server lazy compilation disabled, and the same candidate with it
enabled. Package versions and identical fixture digests are recorded. The last
two arms isolate the option from dependency changes. Without `--stock-repo`, only
those two controlled arms run.

Startup ends when the index page's hydrated click handler works. A second tab
then requests `/catalog/17`; SSR content arrival and that page's interactivity
are timed separately from startup. Every trial checks the original SSR response,
retained text and document identity in the first tab, and absence of reload/HDR
messages during activation. Fresh fixture/output, server and browser instances
are used for each trial; OS filesystem caches are not flushed. Warmups are
excluded and arm order alternates. Default watchers are used and module census
instrumentation is disabled for timing.

Run the verifier separately without `--timing` to assert module counts and source
edit behavior:

```sh
node scripts/verify-react-lazy-catalog.mjs --format esm --count 1000 --edits
node scripts/verify-react-lazy-catalog.mjs --side stock \
  --stock-repo /absolute/path/to/pre-pr-checkout --format esm --count 1000
```

The raw browser benchmark JSON contains all samples, warmups, versions, and
median/min/max values. Lower compiled-module counts establish deferred work;
latency improvement must be established independently from the timing results.

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
