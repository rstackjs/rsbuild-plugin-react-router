<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d62c5f2` against base `90ec8f4`.

**Total median wall time:** 8.89s -> 8.78s (-1.2%, 1.01x speedup)
**Compiler ready median:** 7.52s -> 7.42s (-1.3%)
**Route load median:** 1.33s -> 1.32s (-0.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 8.89s | 8.78s | -1.2% | 7.42s | 1.32s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28338906248)

