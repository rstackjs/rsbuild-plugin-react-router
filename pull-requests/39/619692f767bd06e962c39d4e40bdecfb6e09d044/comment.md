<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `619692f` against base `06ae3db`.

**Total median wall time:** 19.46s -> 8.79s (-54.9%, 2.22x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.38s | 2.13s | -36.9% | 1.59x | 413 MB |
| `synthetic-256-spa` | 8.25s | 2.09s | -74.7% | 3.96x | 398 MB |
| `synthetic-256-ssr-esm` | 3.39s | 2.08s | -38.5% | 1.63x | 396 MB |
| `synthetic-256-ssr-esm-split` | 4.45s | 2.49s | -44.1% | 1.79x | 417 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/27999757137)

