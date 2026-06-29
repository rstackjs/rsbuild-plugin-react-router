<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `80c3447` against base `3f6db5c`.

**Total median wall time:** 11.07s -> 11.02s (-0.5%, 1.00x speedup)
**Compiler ready median:** 9.11s -> 9.09s (-0.1%)
**Route load median:** 1.90s -> 1.86s (-2.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.07s | 11.02s | -0.5% | 9.09s | 1.86s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28394588675)

