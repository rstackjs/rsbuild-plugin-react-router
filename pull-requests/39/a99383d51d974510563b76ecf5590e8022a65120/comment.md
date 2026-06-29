<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a99383d` against base `0287c14`.

**Total median wall time:** 17.20s -> 11.84s (-31.2%, 1.45x speedup)
**Compiler ready median:** 15.15s -> 9.79s (-35.4%)
**Route load median:** 1.97s -> 1.98s (+0.6%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.20s | 11.84s | -31.2% | 9.79s | 1.98s | 1.45x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28345593821)

