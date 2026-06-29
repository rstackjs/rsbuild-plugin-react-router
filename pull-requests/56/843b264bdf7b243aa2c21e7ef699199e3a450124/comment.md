<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `843b264` against base `95874ff`.

**Total median wall time:** 12.07s -> 11.95s (-0.9%, 1.01x speedup)
**Compiler ready median:** 9.96s -> 9.86s (-1.0%)
**Route load median:** 2.04s -> 2.06s (+0.6%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.07s | 11.95s | -0.9% | 9.86s | 2.06s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28349860635)

