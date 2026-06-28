<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `4e6d0f8` against base `6ab91d0`.

**Total median wall time:** 12.35s -> 12.13s (-1.8%, 1.02x speedup)
**Compiler ready median:** 10.17s -> 9.92s (-2.4%)
**Route load median:** 2.10s -> 2.14s (+1.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.35s | 12.13s | -1.8% | 9.92s | 2.14s | 1.02x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334202075)

