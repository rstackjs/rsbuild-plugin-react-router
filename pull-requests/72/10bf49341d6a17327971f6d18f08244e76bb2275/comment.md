<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `10bf493` against base `e10d727`.

**Total median wall time:** 11.89s -> 11.89s (-0.0%, 1.00x speedup)
**Compiler ready median:** 9.84s -> 9.84s (+0.1%)
**Route load median:** 2.01s -> 2.06s (+2.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.89s | 11.89s | -0.0% | 9.84s | 2.06s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28421599309)

