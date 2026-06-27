<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `95bc09e` against base `06ae3db`.

**Total median wall time:** 17.50s -> 11.74s (-32.9%, 1.49x speedup)
**Compiler ready median:** 15.37s -> 9.71s (-36.8%)
**Route load median:** 2.02s -> 2.01s (-0.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.50s | 11.74s | -32.9% | 9.71s | 2.01s | 1.49x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28275491230)

