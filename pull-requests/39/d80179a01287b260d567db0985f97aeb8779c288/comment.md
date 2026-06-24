<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d80179a` against base `06ae3db`.

**Total median wall time:** 20.37s -> 9.36s (-54.0%, 2.18x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.61s | 2.26s | -37.5% | 1.60x | 414 MB |
| `synthetic-256-spa` | 8.47s | 2.24s | -73.6% | 3.79x | 395 MB |
| `synthetic-256-ssr-esm` | 3.53s | 2.21s | -37.5% | 1.60x | 399 MB |
| `synthetic-256-ssr-esm-split` | 4.75s | 2.66s | -44.1% | 1.79x | 419 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28120421261)

