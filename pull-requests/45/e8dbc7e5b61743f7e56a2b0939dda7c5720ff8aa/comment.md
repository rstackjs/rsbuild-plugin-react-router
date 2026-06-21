<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e8dbc7e` against base `0b2b552`.

**Total median wall time:** 19.70s -> 19.58s (-0.6%, 1.01x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.40s | 3.42s | +0.8% | 0.99x | 523 MB |
| `synthetic-256-spa` | 8.31s | 8.28s | -0.4% | 1.00x | 509 MB |
| `synthetic-256-ssr-esm` | 3.42s | 3.35s | -2.3% | 1.02x | 507 MB |
| `synthetic-256-ssr-esm-split` | 4.57s | 4.53s | -0.9% | 1.01x | 723 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/27888427562)

