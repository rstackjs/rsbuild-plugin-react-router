<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ba4f5ef` against base `b322159`.

**Total median wall time:** 9.10s -> 8.30s (-8.8%, 1.10x speedup)
**Compiler ready median:** 9.10s -> 8.30s (-8.8%)
**Route load median:** 1.84s -> 1.87s (+1.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.10s | 8.30s | -8.8% | 8.30s | 1.87s | 1.10x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28405324491)

