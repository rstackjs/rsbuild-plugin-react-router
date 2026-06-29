<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0da6664` against base `f78a0b2`.

**Total median wall time:** 9.35s -> 9.30s (-0.5%, 1.01x speedup)
**Compiler ready median:** 9.35s -> 9.30s (-0.5%)
**Route load median:** 1.89s -> 1.87s (-1.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.35s | 9.30s | -0.5% | 9.30s | 1.87s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28398266759)

