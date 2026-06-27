<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `95e07a1` against base `0c1f1e5`.

**Total median wall time:** 11.69s -> 12.15s (+3.9%, 0.96x speedup)
**Compiler ready median:** 9.69s -> 10.15s (+4.7%)
**Route load median:** 1.93s -> 1.92s (-0.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.69s | 12.15s | +3.9% | 10.15s | 1.92s | 0.96x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28276292578)

