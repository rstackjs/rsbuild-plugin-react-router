<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c3afcde` against base `61f451e`.

**Total median wall time:** 16.27s -> 16.37s (+0.6%, 0.99x speedup)
**Compiler ready median:** 14.31s -> 14.38s (+0.5%)
**Route load median:** 1.85s -> 1.85s (-0.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 16.27s | 16.37s | +0.6% | 14.38s | 1.85s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28338640626)

