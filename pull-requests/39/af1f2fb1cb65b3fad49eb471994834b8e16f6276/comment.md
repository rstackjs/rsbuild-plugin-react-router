<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `af1f2fb` against base `06ae3db`.

**Total median wall time:** 19.90s -> 9.06s (-54.5%, 2.20x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.50s | 2.19s | -37.3% | 1.59x | 420 MB |
| `synthetic-256-spa` | 8.38s | 2.17s | -74.2% | 3.87x | 395 MB |
| `synthetic-256-ssr-esm` | 3.42s | 2.14s | -37.3% | 1.59x | 392 MB |
| `synthetic-256-ssr-esm-split` | 4.61s | 2.56s | -44.6% | 1.81x | 418 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28122591794)

