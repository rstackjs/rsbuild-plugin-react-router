<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e7ef431` against base `06ae3db`.

**Total median wall time:** 19.27s -> 8.68s (-55.0%, 2.22x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.36s | 2.13s | -36.6% | 1.58x | 414 MB |
| `synthetic-256-spa` | 8.21s | 2.05s | -75.1% | 4.01x | 401 MB |
| `synthetic-256-ssr-esm` | 3.27s | 2.05s | -37.1% | 1.59x | 403 MB |
| `synthetic-256-ssr-esm-split` | 4.44s | 2.45s | -44.8% | 1.81x | 420 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28057853967)

