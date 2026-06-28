<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `54debef` against base `b35fdf5`.

**Total median wall time:** 12.40s -> 11.83s (-4.6%, 1.05x speedup)
**Compiler ready median:** 10.22s -> 9.48s (-7.2%)
**Route load median:** 2.12s -> 2.20s (+3.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.40s | 11.83s | -4.6% | 9.48s | 2.20s | 1.05x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28328596545)

