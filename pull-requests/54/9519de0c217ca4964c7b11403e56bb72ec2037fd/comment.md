<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `9519de0` against base `b322159`.

**Total median wall time:** 9.11s -> 8.34s (-8.5%, 1.09x speedup)
**Compiler ready median:** 9.11s -> 8.34s (-8.5%)
**Route load median:** 1.84s -> 1.86s (+1.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.11s | 8.34s | -8.5% | 8.34s | 1.86s | 1.09x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28411597045)

