<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `90ea459` against base `44a6cad`.

**Total median wall time:** 9.44s -> 9.94s (+5.2%, 0.95x speedup)
**Compiler ready median:** 9.44s -> 9.94s (+5.2%)
**Route load median:** 1.92s -> 2.01s (+4.8%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.44s | 9.94s | +5.2% | 9.94s | 2.01s | 0.95x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28338745549)

