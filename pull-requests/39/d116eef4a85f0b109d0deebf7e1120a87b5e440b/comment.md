<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d116eef` against base `06ae3db`.

**Total median wall time:** 20.08s -> 9.22s (-54.1%, 2.18x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.50s | 2.20s | -37.3% | 1.59x | 420 MB |
| `synthetic-256-spa` | 8.40s | 2.19s | -74.0% | 3.84x | 407 MB |
| `synthetic-256-ssr-esm` | 3.48s | 2.18s | -37.6% | 1.60x | 399 MB |
| `synthetic-256-ssr-esm-split` | 4.70s | 2.66s | -43.3% | 1.76x | 425 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28119962314)

