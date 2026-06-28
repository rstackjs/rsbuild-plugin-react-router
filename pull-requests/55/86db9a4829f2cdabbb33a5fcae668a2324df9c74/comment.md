<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `86db9a4` against base `90ea459`.

**Total median wall time:** 8.89s -> 8.07s (-9.2%, 1.10x speedup)
**Compiler ready median:** 8.89s -> 8.07s (-9.2%)
**Route load median:** 1.82s -> 1.80s (-0.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 8.89s | 8.07s | -9.2% | 8.07s | 1.80s | 1.10x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28338872338)

