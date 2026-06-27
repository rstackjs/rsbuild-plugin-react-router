<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `f6f5a93` against base `f90324e`.

**Total median wall time:** 11.92s -> 11.80s (-1.0%, 1.01x speedup)
**Compiler ready median:** 9.89s -> 9.78s (-1.1%)
**Route load median:** 1.98s -> 1.98s (-0.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.92s | 11.80s | -1.0% | 9.78s | 1.98s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28280773837)

