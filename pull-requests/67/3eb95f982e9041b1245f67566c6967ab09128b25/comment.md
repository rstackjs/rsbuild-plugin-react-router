<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `3eb95f9` against base `2637c14`.

**Total median wall time:** 9.73s -> 9.72s (-0.2%, 1.00x speedup)
**Compiler ready median:** 9.73s -> 9.72s (-0.2%)
**Route load median:** 2.02s -> 2.00s (-0.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.73s | 9.72s | -0.2% | 9.72s | 2.00s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28399036368)

