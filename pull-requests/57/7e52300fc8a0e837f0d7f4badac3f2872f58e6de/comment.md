<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `7e52300` against base `9352787`.

**Total median wall time:** 12.22s -> 12.23s (+0.1%, 1.00x speedup)
**Compiler ready median:** 10.06s -> 10.07s (+0.1%)
**Route load median:** 2.09s -> 2.08s (-0.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.22s | 12.23s | +0.1% | 10.07s | 2.08s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28356536764)

