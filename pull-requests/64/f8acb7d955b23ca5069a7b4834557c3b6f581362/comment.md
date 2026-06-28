<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `f8acb7d` against base `fe514bc`.

**Total median wall time:** 16.46s -> 16.44s (-0.2%, 1.00x speedup)
**Compiler ready median:** 14.34s -> 14.44s (+0.7%)
**Route load median:** 1.90s -> 1.88s (-1.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 16.46s | 16.44s | -0.2% | 14.44s | 1.88s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28337964888)

