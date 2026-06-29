<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `fe59510` against base `31e5bf5`.

**Total median wall time:** 18.14s -> 17.99s (-0.8%, 1.01x speedup)
**Compiler ready median:** 15.94s -> 15.73s (-1.3%)
**Route load median:** 2.09s -> 2.14s (+2.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 18.14s | 17.99s | -0.8% | 15.73s | 2.14s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28342388214)

