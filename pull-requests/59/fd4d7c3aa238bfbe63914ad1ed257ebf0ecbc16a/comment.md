<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `fd4d7c3` against base `a38d779`.

**Total median wall time:** 11.10s -> 10.82s (-2.5%, 1.03x speedup)
**Compiler ready median:** 9.10s -> 8.89s (-2.3%)
**Route load median:** 1.94s -> 1.89s (-2.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.10s | 10.82s | -2.5% | 8.89s | 1.89s | 1.03x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28280724042)

