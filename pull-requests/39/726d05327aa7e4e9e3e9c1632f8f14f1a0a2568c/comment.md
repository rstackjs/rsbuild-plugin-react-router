<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `726d053` against base `06ae3db`.

**Total median wall time:** 19.34s -> 8.74s (-54.8%, 2.21x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.38s | 2.14s | -36.8% | 1.58x | 414 MB |
| `synthetic-256-spa` | 8.25s | 2.09s | -74.7% | 3.95x | 405 MB |
| `synthetic-256-ssr-esm` | 3.30s | 2.06s | -37.6% | 1.60x | 396 MB |
| `synthetic-256-ssr-esm-split` | 4.41s | 2.45s | -44.4% | 1.80x | 418 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/27990684002)

