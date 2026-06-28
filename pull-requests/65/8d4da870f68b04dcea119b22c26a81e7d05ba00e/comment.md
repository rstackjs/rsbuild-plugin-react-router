<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `8d4da87` against base `fe514bc`.

**Total median wall time:** 18.14s -> 17.85s (-1.6%, 1.02x speedup)
**Compiler ready median:** 15.62s -> 15.39s (-1.5%)
**Route load median:** 2.11s -> 2.12s (+0.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 18.14s | 17.85s | -1.6% | 15.39s | 2.12s | 1.02x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28336827302)

