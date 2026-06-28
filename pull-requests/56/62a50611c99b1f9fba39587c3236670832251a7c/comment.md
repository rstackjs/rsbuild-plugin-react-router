<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `62a5061` against base `470c3c8`.

**Total median wall time:** 9.80s -> 9.37s (-4.4%, 1.05x speedup)
**Compiler ready median:** 8.11s -> 7.83s (-3.5%)
**Route load median:** 1.53s -> 1.48s (-3.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.80s | 9.37s | -4.4% | 7.83s | 1.48s | 1.05x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334202057)

