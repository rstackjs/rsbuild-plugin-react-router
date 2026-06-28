<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `300c12c` against base `fe514bc`.

**Total median wall time:** 16.31s -> 16.42s (+0.6%, 0.99x speedup)
**Compiler ready median:** 14.32s -> 14.41s (+0.6%)
**Route load median:** 1.89s -> 1.91s (+1.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 16.31s | 16.42s | +0.6% | 14.41s | 1.91s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28333731888)

