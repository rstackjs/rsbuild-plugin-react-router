<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a38d779` against base `88aa4ec`.

**Total median wall time:** 11.93s -> 11.71s (-1.8%, 1.02x speedup)
**Compiler ready median:** 9.76s -> 9.61s (-1.5%)
**Route load median:** 2.12s -> 2.04s (-3.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.93s | 11.71s | -1.8% | 9.61s | 2.04s | 1.02x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28280723847)

