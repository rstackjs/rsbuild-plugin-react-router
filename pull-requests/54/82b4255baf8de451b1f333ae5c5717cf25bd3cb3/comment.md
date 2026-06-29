<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `82b4255` against base `b322159`.

**Total median wall time:** 9.65s -> 8.81s (-8.7%, 1.10x speedup)
**Compiler ready median:** 9.65s -> 8.81s (-8.7%)
**Route load median:** 2.01s -> 1.98s (-1.6%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.65s | 8.81s | -8.7% | 8.81s | 1.98s | 1.10x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28402707598)

