<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `9244167` against base `95874ff`.

**Total median wall time:** 11.28s -> 11.27s (-0.1%, 1.00x speedup)
**Compiler ready median:** 9.32s -> 9.32s (-0.0%)
**Route load median:** 1.88s -> 1.91s (+1.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.28s | 11.27s | -0.1% | 9.32s | 1.91s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28352867654)

