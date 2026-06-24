<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `adcb1a9` against base `06ae3db`.

**Total median wall time:** 20.27s -> 9.40s (-53.6%, 2.16x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.61s | 2.27s | -37.2% | 1.59x | 418 MB |
| `synthetic-256-spa` | 8.39s | 2.27s | -73.0% | 3.71x | 400 MB |
| `synthetic-256-ssr-esm` | 3.47s | 2.19s | -37.0% | 1.59x | 398 MB |
| `synthetic-256-ssr-esm-split` | 4.78s | 2.67s | -44.2% | 1.79x | 416 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28126421591)

