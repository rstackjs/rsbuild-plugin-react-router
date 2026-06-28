<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a061c6c` against base `fe514bc`.

**Total median wall time:** 16.74s -> 16.85s (+0.6%, 0.99x speedup)
**Compiler ready median:** 14.69s -> 14.65s (-0.3%)
**Route load median:** 1.94s -> 2.05s (+5.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 16.74s | 16.85s | +0.6% | 14.65s | 2.05s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28333609127)

