<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `280706c` against base `fe514bc`.

**Total median wall time:** 17.70s -> 17.57s (-0.8%, 1.01x speedup)
**Compiler ready median:** 15.51s -> 15.30s (-1.3%)
**Route load median:** 2.09s -> 2.07s (-0.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.70s | 17.57s | -0.8% | 15.30s | 2.07s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28335056243)

