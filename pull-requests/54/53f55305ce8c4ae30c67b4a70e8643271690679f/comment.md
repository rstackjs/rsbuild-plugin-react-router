<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `53f5530` against base `b322159`.

**Total median wall time:** 9.09s -> 8.32s (-8.5%, 1.09x speedup)
**Compiler ready median:** 9.09s -> 8.32s (-8.5%)
**Route load median:** 1.85s -> 1.85s (+0.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.09s | 8.32s | -8.5% | 8.32s | 1.85s | 1.09x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28407429547)

