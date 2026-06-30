<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `7982f17` against base `9519de0`.

**Total median wall time:** 9.27s -> 9.16s (-1.2%, 1.01x speedup)
**Compiler ready median:** 9.27s -> 9.16s (-1.2%)
**Route load median:** 2.07s -> 2.10s (+1.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.27s | 9.16s | -1.2% | 9.16s | 2.10s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28414731123)

