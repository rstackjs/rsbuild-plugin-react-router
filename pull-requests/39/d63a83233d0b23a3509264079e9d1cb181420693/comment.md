<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d63a832` against base `06ae3db`.

**Total median wall time:** 19.94s -> 9.18s (-54.0%, 2.17x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.47s | 2.23s | -35.7% | 1.56x | 419 MB |
| `synthetic-256-spa` | 8.37s | 2.17s | -74.1% | 3.86x | 402 MB |
| `synthetic-256-ssr-esm` | 3.43s | 2.17s | -36.9% | 1.58x | 394 MB |
| `synthetic-256-ssr-esm-split` | 4.66s | 2.61s | -44.0% | 1.79x | 416 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28135836619)

