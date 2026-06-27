<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `f56ca89` against base `470c3c8`.

**Total median wall time:** 12.26s -> 12.31s (+0.4%, 1.00x speedup)
**Compiler ready median:** 10.06s -> 10.21s (+1.5%)
**Route load median:** 2.16s -> 2.04s (-5.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.26s | 12.31s | +0.4% | 10.21s | 2.04s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28278348979)

