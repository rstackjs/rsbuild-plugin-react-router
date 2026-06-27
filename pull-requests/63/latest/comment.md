<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `f90324e` against base `ba9023e`.

**Total median wall time:** 10.72s -> 10.73s (+0.0%, 1.00x speedup)
**Compiler ready median:** 8.90s -> 8.91s (+0.1%)
**Route load median:** 1.79s -> 1.79s (+0.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 10.72s | 10.73s | +0.0% | 8.91s | 1.79s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28280543011)

