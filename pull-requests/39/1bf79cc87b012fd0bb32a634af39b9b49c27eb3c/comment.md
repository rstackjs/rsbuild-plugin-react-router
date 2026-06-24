<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1bf79cc` against base `06ae3db`.

**Total median wall time:** 20.30s -> 9.29s (-54.3%, 2.19x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.58s | 2.28s | -36.4% | 1.57x | 421 MB |
| `synthetic-256-spa` | 8.45s | 2.20s | -73.9% | 3.83x | 398 MB |
| `synthetic-256-ssr-esm` | 3.55s | 2.18s | -38.4% | 1.62x | 399 MB |
| `synthetic-256-ssr-esm-split` | 4.72s | 2.62s | -44.6% | 1.80x | 423 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28120910440)

