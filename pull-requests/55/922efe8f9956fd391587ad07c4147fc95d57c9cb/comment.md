<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `922efe8` against base `2d960ac`.

**Total median wall time:** 11.64s -> 10.73s (-7.9%, 1.09x speedup)
**Compiler ready median:** 9.64s -> 8.43s (-12.6%)
**Route load median:** 1.93s -> 2.20s (+14.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.64s | 10.73s | -7.9% | 8.43s | 2.20s | 1.09x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28281231431)

