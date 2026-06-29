<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e748e5f` against base `b322159`.

**Total median wall time:** 9.69s -> 8.93s (-7.9%, 1.09x speedup)
**Compiler ready median:** 9.69s -> 8.93s (-7.9%)
**Route load median:** 2.00s -> 2.06s (+2.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.69s | 8.93s | -7.9% | 8.93s | 2.06s | 1.09x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28404473746)

