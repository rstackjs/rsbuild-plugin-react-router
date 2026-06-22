<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `933962d` against base `06ae3db`.

**Total median wall time:** 20.35s -> 9.40s (-53.8%, 2.16x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.59s | 2.31s | -35.7% | 1.56x | 413 MB |
| `synthetic-256-spa` | 8.46s | 2.25s | -73.4% | 3.76x | 401 MB |
| `synthetic-256-ssr-esm` | 3.59s | 2.21s | -38.6% | 1.63x | 398 MB |
| `synthetic-256-ssr-esm-split` | 4.70s | 2.64s | -43.9% | 1.78x | 412 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/27983490965)

