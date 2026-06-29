<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `323e500` against base `3f6db5c`.

**Total median wall time:** 10.24s -> 9.79s (-4.4%, 1.05x speedup)
**Compiler ready median:** 8.61s -> 8.16s (-5.2%)
**Route load median:** 1.56s -> 1.54s (-1.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 10.24s | 9.79s | -4.4% | 8.16s | 1.54s | 1.05x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28393428752)

