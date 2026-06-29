<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `956ef5f` against base `95874ff`.

**Total median wall time:** 11.72s -> 11.67s (-0.5%, 1.00x speedup)
**Compiler ready median:** 9.70s -> 9.60s (-1.0%)
**Route load median:** 1.98s -> 1.99s (+0.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.72s | 11.67s | -0.5% | 9.60s | 1.99s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28351763504)

