<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `b09e3a9` against base `3f6db5c`.

**Total median wall time:** 11.90s -> 11.95s (+0.4%, 1.00x speedup)
**Compiler ready median:** 9.86s -> 9.81s (-0.5%)
**Route load median:** 2.01s -> 2.03s (+1.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.90s | 11.95s | +0.4% | 9.81s | 2.03s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28386917405)

