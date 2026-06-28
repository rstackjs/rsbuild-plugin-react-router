<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `8395cf7` against base `fe514bc`.

**Total median wall time:** 17.34s -> 17.51s (+1.0%, 0.99x speedup)
**Compiler ready median:** 15.21s -> 15.38s (+1.2%)
**Route load median:** 2.03s -> 2.02s (-0.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.34s | 17.51s | +1.0% | 15.38s | 2.02s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334239195)

