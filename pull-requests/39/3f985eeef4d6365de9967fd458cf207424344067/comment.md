<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `3f985ee` against base `06ae3db`.

**Total median wall time:** 18.81s -> 8.11s (-56.9%, 2.32x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.21s | 1.96s | -38.8% | 1.63x | 407 MB |
| `synthetic-256-spa` | 8.11s | 1.94s | -76.1% | 4.18x | 402 MB |
| `synthetic-256-ssr-esm` | 3.18s | 1.91s | -40.1% | 1.67x | 393 MB |
| `synthetic-256-ssr-esm-split` | 4.31s | 2.30s | -46.7% | 1.88x | 420 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28057244932)

