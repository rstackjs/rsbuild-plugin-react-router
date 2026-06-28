<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `6ab91d0` against base `8b08bd7`.

**Total median wall time:** 11.89s -> 11.96s (+0.6%, 0.99x speedup)
**Compiler ready median:** 9.82s -> 9.81s (-0.1%)
**Route load median:** 2.03s -> 2.11s (+4.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.89s | 11.96s | +0.6% | 9.81s | 2.11s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334201951)

