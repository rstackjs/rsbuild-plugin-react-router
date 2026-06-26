<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `7ab5645` against base `06ae3db`.

**Total median wall time:** 20.24s -> 9.11s (-55.0%, 2.22x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.57s | 2.24s | -37.1% | 1.59x | 414 MB |
| `synthetic-256-spa` | 8.44s | 2.18s | -74.2% | 3.88x | 382 MB |
| `synthetic-256-ssr-esm` | 3.51s | 2.15s | -38.8% | 1.63x | 375 MB |
| `synthetic-256-ssr-esm-split` | 4.72s | 2.54s | -46.2% | 1.86x | 415 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28269683235)

