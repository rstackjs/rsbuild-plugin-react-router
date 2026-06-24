<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d61b3ad` against base `06ae3db`.

**Total median wall time:** 20.37s -> 9.46s (-53.6%, 2.15x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.66s | 2.27s | -37.9% | 1.61x | 408 MB |
| `synthetic-256-spa` | 8.47s | 2.26s | -73.3% | 3.74x | 410 MB |
| `synthetic-256-ssr-esm` | 3.50s | 2.24s | -36.0% | 1.56x | 393 MB |
| `synthetic-256-ssr-esm-split` | 4.74s | 2.69s | -43.4% | 1.77x | 420 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28126055897)

