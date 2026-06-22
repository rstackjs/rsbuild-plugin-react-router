<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0c380e3` against base `06ae3db`.

**Total median wall time:** 19.80s -> 9.05s (-54.3%, 2.19x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.43s | 2.23s | -35.1% | 1.54x | 417 MB |
| `synthetic-256-spa` | 8.36s | 2.14s | -74.4% | 3.91x | 407 MB |
| `synthetic-256-ssr-esm` | 3.42s | 2.15s | -37.2% | 1.59x | 399 MB |
| `synthetic-256-ssr-esm-split` | 4.58s | 2.54s | -44.5% | 1.80x | 417 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/27988078360)

