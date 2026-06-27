<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0c1f1e5` against base `fe514bc`.

**Total median wall time:** 17.28s -> 11.83s (-31.5%, 1.46x speedup)
**Compiler ready median:** 15.18s -> 9.78s (-35.6%)
**Route load median:** 2.07s -> 1.98s (-4.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.28s | 11.83s | -31.5% | 9.78s | 1.98s | 1.46x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28276243360)

