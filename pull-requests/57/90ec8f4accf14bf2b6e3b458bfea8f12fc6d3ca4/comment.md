<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `90ec8f4` against base `cc3133e`.

**Total median wall time:** 11.99s -> 11.64s (-2.8%, 1.03x speedup)
**Compiler ready median:** 9.80s -> 9.61s (-1.9%)
**Route load median:** 1.96s -> 2.00s (+2.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.99s | 11.64s | -2.8% | 9.61s | 2.00s | 1.03x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28338853882)

