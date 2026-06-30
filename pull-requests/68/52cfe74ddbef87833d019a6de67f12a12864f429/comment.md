<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `52cfe74` against base `2637c14`.

**Total median wall time:** 9.85s -> 8.85s (-10.2%, 1.11x speedup)
**Compiler ready median:** 9.85s -> 8.85s (-10.2%)
**Route load median:** 2.02s -> 2.00s (-1.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.85s | 8.85s | -10.2% | 8.85s | 2.00s | 1.11x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28414721557)

