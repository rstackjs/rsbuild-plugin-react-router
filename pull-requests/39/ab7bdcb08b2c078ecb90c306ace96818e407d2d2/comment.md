<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ab7bdcb` against base `06ae3db`.

**Total median wall time:** 18.79s -> 8.27s (-56.0%, 2.27x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.18s | 2.02s | -36.3% | 1.57x | 410 MB |
| `synthetic-256-spa` | 8.09s | 1.95s | -75.9% | 4.14x | 398 MB |
| `synthetic-256-ssr-esm` | 3.19s | 1.94s | -39.1% | 1.64x | 391 MB |
| `synthetic-256-ssr-esm-split` | 4.33s | 2.35s | -45.7% | 1.84x | 419 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28132146512)

