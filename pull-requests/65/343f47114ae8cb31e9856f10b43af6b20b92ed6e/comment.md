<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `343f471` against base `fe514bc`.

**Total median wall time:** 18.28s -> 18.49s (+1.2%, 0.99x speedup)
**Compiler ready median:** 16.06s -> 16.20s (+0.9%)
**Route load median:** 2.12s -> 2.19s (+3.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 18.28s | 18.49s | +1.2% | 16.20s | 2.19s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334239973)

