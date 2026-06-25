<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `10c5670` against base `06ae3db`.

**Total median wall time:** 20.66s -> 9.65s (-53.3%, 2.14x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.63s | 2.35s | -35.3% | 1.54x | 419 MB |
| `synthetic-256-spa` | 8.48s | 2.31s | -72.8% | 3.67x | 402 MB |
| `synthetic-256-ssr-esm` | 3.64s | 2.27s | -37.8% | 1.61x | 398 MB |
| `synthetic-256-ssr-esm-split` | 4.91s | 2.73s | -44.5% | 1.80x | 415 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28137562548)

