<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `668fbf8` against base `6a49a94`.

**Total median wall time:** 12.24s -> 12.10s (-1.1%, 1.01x speedup)
**Compiler ready median:** 10.04s -> 9.94s (-0.9%)
**Route load median:** 2.14s -> 2.08s (-2.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.24s | 12.10s | -1.1% | 9.94s | 2.08s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334188083)

