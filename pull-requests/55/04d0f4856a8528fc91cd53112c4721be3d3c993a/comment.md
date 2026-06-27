<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `04d0f48` against base `2d960ac`.

**Total median wall time:** 11.72s -> 10.43s (-11.0%, 1.12x speedup)
**Compiler ready median:** 9.72s -> 8.29s (-14.6%)
**Route load median:** 1.95s -> 1.96s (+0.6%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.72s | 10.43s | -11.0% | 8.29s | 1.96s | 1.12x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28282073331)

