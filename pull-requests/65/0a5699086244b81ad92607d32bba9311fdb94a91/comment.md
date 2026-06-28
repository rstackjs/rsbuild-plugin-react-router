<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0a56990` against base `61f451e`.

**Total median wall time:** 18.33s -> 18.33s (-0.0%, 1.00x speedup)
**Compiler ready median:** 16.09s -> 16.07s (-0.1%)
**Route load median:** 2.12s -> 2.15s (+1.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 18.33s | 18.33s | -0.0% | 16.07s | 2.15s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28339668951)

