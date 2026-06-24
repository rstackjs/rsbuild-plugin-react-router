<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `aee4bd3` against base `06ae3db`.

**Total median wall time:** 20.33s -> 9.41s (-53.7%, 2.16x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.58s | 2.32s | -35.0% | 1.54x | 403 MB |
| `synthetic-256-spa` | 8.52s | 2.25s | -73.7% | 3.80x | 403 MB |
| `synthetic-256-ssr-esm` | 3.51s | 2.21s | -37.2% | 1.59x | 398 MB |
| `synthetic-256-ssr-esm-split` | 4.72s | 2.63s | -44.2% | 1.79x | 416 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28119325851)

