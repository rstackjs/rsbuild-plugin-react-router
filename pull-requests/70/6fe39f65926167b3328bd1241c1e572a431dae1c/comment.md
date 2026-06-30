<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `6fe39f6` against base `b322159`.

**Total median wall time:** 9.84s -> 9.63s (-2.2%, 1.02x speedup)
**Compiler ready median:** 8.22s -> 8.07s (-1.8%)
**Route load median:** 1.55s -> 1.54s (-0.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.84s | 9.63s | -2.2% | 8.07s | 1.54s | 1.02x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28418722945)

