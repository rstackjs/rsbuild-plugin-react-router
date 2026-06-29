<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `7a4e7fd` against base `6c6000b`.

**Total median wall time:** 9.30s -> 9.31s (+0.1%, 1.00x speedup)
**Compiler ready median:** 9.30s -> 9.31s (+0.1%)
**Route load median:** 1.87s -> 1.90s (+1.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.30s | 9.31s | +0.1% | 9.31s | 1.90s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28346665763)

