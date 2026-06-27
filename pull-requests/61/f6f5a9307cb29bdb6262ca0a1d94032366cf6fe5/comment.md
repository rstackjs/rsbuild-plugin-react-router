<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `f6f5a93` against base `fe514bc`.

**Total median wall time:** 17.45s -> 12.12s (-30.5%, 1.44x speedup)
**Compiler ready median:** 15.31s -> 10.04s (-34.4%)
**Route load median:** 1.99s -> 2.05s (+3.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.45s | 12.12s | -30.5% | 10.04s | 2.05s | 1.44x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28280482616)

