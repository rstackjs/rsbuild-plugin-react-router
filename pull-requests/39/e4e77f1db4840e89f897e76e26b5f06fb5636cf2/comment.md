<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e4e77f1` against base `06ae3db`.

**Total median wall time:** 20.45s -> 9.07s (-55.6%, 2.25x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.58s | 2.23s | -37.7% | 1.61x | 432 MB |
| `synthetic-256-spa` | 8.44s | 2.17s | -74.2% | 3.88x | 396 MB |
| `synthetic-256-ssr-esm` | 3.63s | 2.13s | -41.2% | 1.70x | 404 MB |
| `synthetic-256-ssr-esm-split` | 4.80s | 2.53s | -47.2% | 1.89x | 429 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28263820178)

