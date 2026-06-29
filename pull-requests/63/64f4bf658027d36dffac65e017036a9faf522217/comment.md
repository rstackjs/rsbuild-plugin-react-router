<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `64f4bf6` against base `0da6664`.

**Total median wall time:** 9.35s -> 9.33s (-0.2%, 1.00x speedup)
**Compiler ready median:** 9.35s -> 9.33s (-0.2%)
**Route load median:** 1.90s -> 1.88s (-1.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.35s | 9.33s | -0.2% | 9.33s | 1.88s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28398350211)

