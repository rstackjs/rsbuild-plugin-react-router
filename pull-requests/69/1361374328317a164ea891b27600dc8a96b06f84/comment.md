<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1361374` against base `9519de0`.

**Total median wall time:** 8.87s -> 8.81s (-0.6%, 1.01x speedup)
**Compiler ready median:** 8.87s -> 8.81s (-0.6%)
**Route load median:** 1.99s -> 2.00s (+0.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 8.87s | 8.81s | -0.6% | 8.81s | 2.00s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28413797602)

