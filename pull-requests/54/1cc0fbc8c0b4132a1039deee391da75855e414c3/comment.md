<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1cc0fbc` against base `0f9b463`.

**Total median wall time:** 10.23s -> 9.32s (-8.9%, 1.10x speedup)
**Compiler ready median:** 10.23s -> 9.32s (-8.9%)
**Route load median:** 2.14s -> 2.14s (+0.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 10.23s | 9.32s | -8.9% | 9.32s | 2.14s | 1.10x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28458284796)

