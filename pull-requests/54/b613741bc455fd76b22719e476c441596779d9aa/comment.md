<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `b613741` against base `0f9b463`.

**Total median wall time:** 9.54s -> 9.02s (-5.4%, 1.06x speedup)
**Compiler ready median:** 9.54s -> 9.02s (-5.4%)
**Route load median:** 2.00s -> 2.07s (+3.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.54s | 9.02s | -5.4% | 9.02s | 2.07s | 1.06x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28422369400)

