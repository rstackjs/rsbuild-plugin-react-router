<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d93adf4` against base `06ae3db`.

**Total median wall time:** 20.63s -> 9.88s (-52.1%, 2.09x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.78s | 2.33s | -38.5% | 1.62x | 421 MB |
| `synthetic-256-spa` | 8.54s | 2.37s | -72.3% | 3.61x | 401 MB |
| `synthetic-256-ssr-esm` | 3.57s | 2.38s | -33.2% | 1.50x | 402 MB |
| `synthetic-256-ssr-esm-split` | 4.73s | 2.80s | -40.9% | 1.69x | 416 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/27889052804)

