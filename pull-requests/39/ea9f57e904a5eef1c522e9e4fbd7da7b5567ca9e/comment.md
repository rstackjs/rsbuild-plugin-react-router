<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ea9f57e` against base `06ae3db`.

**Total median wall time:** 18.52s -> 8.66s (-53.2%, 2.14x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.48s | 2.14s | -38.4% | 1.62x | 428 MB |
| `synthetic-256-spa` | 8.30s | 2.06s | -75.1% | 4.02x | 382 MB |
| `synthetic-256-ssr-esm` | 3.38s | 2.03s | -39.9% | 1.66x | 374 MB |
| `synthetic-256-ssr-esm-split` | 3.37s | 2.42s | -28.1% | 1.39x | 422 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28272636338)

