<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2f2d4d6` against base `06ae3db`.

**Total median wall time:** 19.56s -> 8.83s (-54.9%, 2.22x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.43s | 2.14s | -37.6% | 1.60x | 410 MB |
| `synthetic-256-spa` | 8.30s | 2.12s | -74.4% | 3.91x | 394 MB |
| `synthetic-256-ssr-esm` | 3.32s | 2.10s | -36.9% | 1.59x | 383 MB |
| `synthetic-256-ssr-esm-split` | 4.51s | 2.47s | -45.2% | 1.83x | 418 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28118265810)

