<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `433d9b2` against base `06ae3db`.

**Total median wall time:** 19.68s -> 9.07s (-53.9%, 2.17x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.53s | 2.18s | -38.2% | 1.62x | 411 MB |
| `synthetic-256-spa` | 8.33s | 2.14s | -74.3% | 3.89x | 396 MB |
| `synthetic-256-ssr-esm` | 3.32s | 2.15s | -35.1% | 1.54x | 383 MB |
| `synthetic-256-ssr-esm-split` | 4.49s | 2.58s | -42.5% | 1.74x | 414 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28217754502)

