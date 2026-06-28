<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `151404d` against base `61f451e`.

**Total median wall time:** 16.85s -> 16.60s (-1.5%, 1.01x speedup)
**Compiler ready median:** 14.58s -> 14.57s (-0.1%)
**Route load median:** 1.94s -> 1.92s (-1.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 16.85s | 16.60s | -1.5% | 14.57s | 1.92s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28339462753)

