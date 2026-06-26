<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `be0058d` against base `06ae3db`.

**Total median wall time:** 16.85s -> 7.10s (-57.9%, 2.37x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 2.81s | 1.72s | -38.8% | 1.64x | 404 MB |
| `synthetic-256-spa` | 7.67s | 1.67s | -78.2% | 4.60x | 397 MB |
| `synthetic-256-ssr-esm` | 2.76s | 1.69s | -38.8% | 1.63x | 397 MB |
| `synthetic-256-ssr-esm-split` | 3.61s | 2.02s | -44.0% | 1.78x | 436 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28254001186)

