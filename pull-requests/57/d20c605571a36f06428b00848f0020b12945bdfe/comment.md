<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d20c605` against base `9352787`.

**Total median wall time:** 10.84s -> 10.69s (-1.4%, 1.01x speedup)
**Compiler ready median:** 8.94s -> 8.83s (-1.2%)
**Route load median:** 1.85s -> 1.82s (-1.6%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 10.84s | 10.69s | -1.4% | 8.83s | 1.82s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28354403747)

