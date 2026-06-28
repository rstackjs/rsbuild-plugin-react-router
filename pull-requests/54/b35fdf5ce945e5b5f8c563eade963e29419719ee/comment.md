<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `b35fdf5` against base `470c3c8`.

**Total median wall time:** 12.18s -> 12.26s (+0.7%, 0.99x speedup)
**Compiler ready median:** 9.96s -> 10.05s (+0.8%)
**Route load median:** 2.14s -> 2.12s (-0.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.18s | 12.26s | +0.7% | 10.05s | 2.12s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28326966022)

