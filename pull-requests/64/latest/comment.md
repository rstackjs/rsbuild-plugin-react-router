<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0278cb2` against base `fe514bc`.

**Total median wall time:** 14.48s -> 14.78s (+2.1%, 0.98x speedup)
**Compiler ready median:** 12.93s -> 13.21s (+2.1%)
**Route load median:** 1.57s -> 1.54s (-1.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 14.48s | 14.78s | +2.1% | 13.21s | 1.54s | 0.98x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28333534848)

