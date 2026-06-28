<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ec405f0` against base `fe514bc`.

**Total median wall time:** 16.21s -> 16.01s (-1.2%, 1.01x speedup)
**Compiler ready median:** 14.21s -> 14.13s (-0.6%)
**Route load median:** 1.91s -> 1.91s (-0.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 16.21s | 16.01s | -1.2% | 14.13s | 1.91s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28337222440)

