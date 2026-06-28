<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ad77a93` against base `61f451e`.

**Total median wall time:** 17.37s -> 11.62s (-33.1%, 1.50x speedup)
**Compiler ready median:** 15.29s -> 9.61s (-37.1%)
**Route load median:** 1.98s -> 2.02s (+1.8%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.37s | 11.62s | -33.1% | 9.61s | 2.02s | 1.50x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28339768428)

