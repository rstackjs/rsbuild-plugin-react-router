<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2f103ea` against base `06ae3db`.

**Total median wall time:** 20.11s -> 9.27s (-53.9%, 2.17x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.56s | 2.26s | -36.6% | 1.58x | 409 MB |
| `synthetic-256-spa` | 8.39s | 2.22s | -73.6% | 3.78x | 396 MB |
| `synthetic-256-ssr-esm` | 3.51s | 2.19s | -37.7% | 1.60x | 390 MB |
| `synthetic-256-ssr-esm-split` | 4.65s | 2.61s | -44.0% | 1.78x | 415 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28130078169)

