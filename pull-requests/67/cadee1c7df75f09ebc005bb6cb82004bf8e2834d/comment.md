<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `cadee1c` against base `6c6000b`.

**Total median wall time:** 9.39s -> 9.41s (+0.2%, 1.00x speedup)
**Compiler ready median:** 9.39s -> 9.41s (+0.2%)
**Route load median:** 1.94s -> 1.90s (-2.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.39s | 9.41s | +0.2% | 9.41s | 1.90s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28377402374)

