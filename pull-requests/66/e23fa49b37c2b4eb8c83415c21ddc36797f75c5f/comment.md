<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e23fa49` against base `fe514bc`.

**Total median wall time:** 17.92s -> 17.91s (-0.1%, 1.00x speedup)
**Compiler ready median:** 15.85s -> 15.55s (-1.9%)
**Route load median:** 1.99s -> 2.22s (+11.6%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.92s | 17.91s | -0.1% | 15.55s | 2.22s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28333878180)

