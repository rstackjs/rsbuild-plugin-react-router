<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a25cc3d` against base `fe514bc`.

**Total median wall time:** 16.49s -> 16.69s (+1.2%, 0.99x speedup)
**Compiler ready median:** 14.48s -> 14.70s (+1.5%)
**Route load median:** 1.92s -> 1.89s (-1.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 16.49s | 16.69s | +1.2% | 14.70s | 1.89s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28333562824)

