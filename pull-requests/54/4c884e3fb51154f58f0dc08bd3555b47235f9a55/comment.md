<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `4c884e3` against base `b322159`.

**Total median wall time:** 9.76s -> 9.05s (-7.2%, 1.08x speedup)
**Compiler ready median:** 9.76s -> 9.05s (-7.2%)
**Route load median:** 2.02s -> 2.01s (-0.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.76s | 9.05s | -7.2% | 9.05s | 2.01s | 1.08x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28409704896)

