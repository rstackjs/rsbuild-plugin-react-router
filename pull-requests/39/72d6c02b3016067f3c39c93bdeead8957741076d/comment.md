<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `72d6c02` against base `06ae3db`.

**Total median wall time:** 20.01s -> 9.22s (-53.9%, 2.17x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-256-sourcemaps` | 3.50s | 2.25s | -35.7% | 1.56x | 411 MB |
| `synthetic-256-spa` | 8.40s | 2.20s | -73.8% | 3.82x | 395 MB |
| `synthetic-256-ssr-esm` | 3.49s | 2.16s | -38.0% | 1.61x | 392 MB |
| `synthetic-256-ssr-esm-split` | 4.62s | 2.61s | -43.6% | 1.77x | 415 MB |

Profile: `default`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28137108782)

