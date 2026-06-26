<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1133507` against base `06ae3db`.

**Total median wall time:** 17.12s -> 7.16s (-58.2%, 2.39x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 2.86s | 1.77s | -38.0% | 1.61x | 424 MB |
| `synthetic-256-spa` | 7.70s | 1.67s | -78.3% | 4.61x | 391 MB |
| `synthetic-256-ssr-esm` | 2.84s | 1.68s | -40.7% | 1.69x | 401 MB |
| `synthetic-256-ssr-esm-split` | 3.73s | 2.03s | -45.6% | 1.84x | 429 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28268808324)

