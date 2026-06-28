<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `7fe442c` against base `90ea459`.

**Total median wall time:** 9.93s -> 9.92s (-0.0%, 1.00x speedup)
**Compiler ready median:** 9.93s -> 9.92s (-0.0%)
**Route load median:** 2.04s -> 2.03s (-0.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.93s | 9.92s | -0.0% | 9.92s | 2.03s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28338789630)

