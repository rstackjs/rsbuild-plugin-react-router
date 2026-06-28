<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2bac7be` against base `fe514bc`.

**Total median wall time:** 17.93s -> 17.79s (-0.8%, 1.01x speedup)
**Compiler ready median:** 15.72s -> 15.62s (-0.6%)
**Route load median:** 2.11s -> 2.07s (-1.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.93s | 17.79s | -0.8% | 15.62s | 2.07s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28336643204)

