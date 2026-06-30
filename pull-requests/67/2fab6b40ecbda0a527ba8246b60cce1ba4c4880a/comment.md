<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2fab6b4` against base `785ce8b`.

**Total median wall time:** 8.75s -> 8.73s (-0.2%, 1.00x speedup)
**Compiler ready median:** 8.75s -> 8.73s (-0.2%)
**Route load median:** 1.98s -> 2.03s (+2.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 8.75s | 8.73s | -0.2% | 8.73s | 2.03s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28415419929)

