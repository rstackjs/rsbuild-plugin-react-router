<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c0ac92b` against base `fe514bc`.

**Total median wall time:** 17.94s -> 17.93s (-0.1%, 1.00x speedup)
**Compiler ready median:** 15.69s -> 15.72s (+0.2%)
**Route load median:** 2.11s -> 2.11s (-0.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.94s | 17.93s | -0.1% | 15.72s | 2.11s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28333710619)

