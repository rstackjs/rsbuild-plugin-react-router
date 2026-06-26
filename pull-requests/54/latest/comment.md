<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `b1095e4` against base `06ae3db`.

**Total median wall time:** 20.27s -> 9.08s (-55.2%, 2.23x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.57s | 2.27s | -36.5% | 1.57x | 446 MB |
| `synthetic-256-spa` | 8.46s | 2.16s | -74.5% | 3.92x | 407 MB |
| `synthetic-256-ssr-esm` | 3.53s | 2.12s | -40.0% | 1.67x | 394 MB |
| `synthetic-256-ssr-esm-split` | 4.71s | 2.54s | -46.2% | 1.86x | 426 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28271772669)

