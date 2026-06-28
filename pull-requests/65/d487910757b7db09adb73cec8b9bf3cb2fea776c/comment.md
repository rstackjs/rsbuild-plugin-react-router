<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d487910` against base `fe514bc`.

**Total median wall time:** 17.71s -> 17.60s (-0.6%, 1.01x speedup)
**Compiler ready median:** 15.58s -> 15.46s (-0.8%)
**Route load median:** 2.03s -> 2.04s (+0.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.71s | 17.60s | -0.6% | 15.46s | 2.04s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28337049114)

