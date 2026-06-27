<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `470c3c8` against base `fe514bc`.

**Total median wall time:** 16.35s -> 11.00s (-32.7%, 1.49x speedup)
**Compiler ready median:** 14.36s -> 9.03s (-37.1%)
**Route load median:** 1.87s -> 1.89s (+0.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 16.35s | 11.00s | -32.7% | 9.03s | 1.89s | 1.49x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28276132219)

