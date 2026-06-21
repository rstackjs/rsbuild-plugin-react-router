<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ee77122` against base `0b2b552`.

**Total median wall time:** 20.00s -> 19.99s (-0.1%, 1.00x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.51s | 3.49s | -0.6% | 1.01x | 519 MB |
| `synthetic-256-spa` | 8.39s | 8.43s | +0.5% | 1.00x | 503 MB |
| `synthetic-256-ssr-esm` | 3.47s | 3.46s | -0.4% | 1.00x | 505 MB |
| `synthetic-256-ssr-esm-split` | 4.62s | 4.61s | -0.3% | 1.00x | 702 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/27888298658)

