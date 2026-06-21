<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0004359` against base `0b2b552`.

**Total median wall time:** 19.68s -> 19.73s (+0.3%, 1.00x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.41s | 3.44s | +0.9% | 0.99x | 521 MB |
| `synthetic-256-spa` | 8.27s | 8.32s | +0.6% | 0.99x | 519 MB |
| `synthetic-256-ssr-esm` | 3.42s | 3.37s | -1.5% | 1.01x | 501 MB |
| `synthetic-256-ssr-esm-split` | 4.58s | 4.61s | +0.5% | 0.99x | 713 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/27888107430)

