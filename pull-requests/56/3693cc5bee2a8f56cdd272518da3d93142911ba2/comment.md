<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `3693cc5` against base `95874ff`.

**Total median wall time:** 11.09s -> 11.07s (-0.2%, 1.00x speedup)
**Compiler ready median:** 9.20s -> 9.19s (-0.2%)
**Route load median:** 1.87s -> 1.86s (-1.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.09s | 11.07s | -0.2% | 9.19s | 1.86s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28353622139)

