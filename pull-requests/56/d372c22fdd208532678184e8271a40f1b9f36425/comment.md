<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d372c22` against base `95874ff`.

**Total median wall time:** 11.54s -> 11.62s (+0.7%, 0.99x speedup)
**Compiler ready median:** 9.58s -> 9.60s (+0.2%)
**Route load median:** 1.98s -> 1.97s (-0.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.54s | 11.62s | +0.7% | 9.60s | 1.97s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28351291094)

