<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `eb93b70` against base `06ae3db`.

**Total median wall time:** 20.02s -> 9.22s (-53.9%, 2.17x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.52s | 2.23s | -36.7% | 1.58x | 414 MB |
| `synthetic-256-spa` | 8.38s | 2.22s | -73.5% | 3.77x | 392 MB |
| `synthetic-256-ssr-esm` | 3.45s | 2.16s | -37.2% | 1.59x | 393 MB |
| `synthetic-256-ssr-esm-split` | 4.67s | 2.61s | -44.2% | 1.79x | 417 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28249171402)

