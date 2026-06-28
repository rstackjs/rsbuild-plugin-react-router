<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `cc3133e` against base `44a6cad`.

**Total median wall time:** 11.75s -> 11.71s (-0.4%, 1.00x speedup)
**Compiler ready median:** 9.74s -> 9.66s (-0.8%)
**Route load median:** 1.96s -> 2.00s (+1.8%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.75s | 11.71s | -0.4% | 9.66s | 2.00s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28338830140)

