<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `04347ff` against base `fe514bc`.

**Total median wall time:** 17.96s -> 18.15s (+1.1%, 0.99x speedup)
**Compiler ready median:** 15.74s -> 15.92s (+1.1%)
**Route load median:** 2.18s -> 2.12s (-2.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.96s | 18.15s | +1.1% | 15.92s | 2.12s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28335056240)

