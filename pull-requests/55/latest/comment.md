<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `01df6b5` against base `06ae3db`.

**Total median wall time:** 19.50s -> 9.50s (-51.3%, 2.05x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.39s | 2.38s | -29.8% | 1.43x | 457 MB |
| `synthetic-256-spa` | 8.30s | 2.28s | -72.5% | 3.64x | 428 MB |
| `synthetic-256-ssr-esm` | 3.35s | 2.24s | -33.1% | 1.50x | 417 MB |
| `synthetic-256-ssr-esm-split` | 4.47s | 2.61s | -41.6% | 1.71x | 449 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28272733930)

