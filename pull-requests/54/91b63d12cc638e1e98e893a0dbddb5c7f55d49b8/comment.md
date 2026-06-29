<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `91b63d1` against base `3f6db5c`.

**Total median wall time:** 9.19s -> 9.23s (+0.4%, 1.00x speedup)
**Compiler ready median:** 9.19s -> 9.23s (+0.4%)
**Route load median:** 1.85s -> 1.86s (+0.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.19s | 9.23s | +0.4% | 9.23s | 1.86s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28387504442)

