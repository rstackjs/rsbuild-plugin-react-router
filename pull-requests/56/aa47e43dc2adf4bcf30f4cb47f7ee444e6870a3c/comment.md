<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `aa47e43` against base `95874ff`.

**Total median wall time:** 11.71s -> 11.65s (-0.5%, 1.01x speedup)
**Compiler ready median:** 9.64s -> 9.57s (-0.7%)
**Route load median:** 2.00s -> 2.01s (+0.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.71s | 11.65s | -0.5% | 9.57s | 2.01s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28351155071)

