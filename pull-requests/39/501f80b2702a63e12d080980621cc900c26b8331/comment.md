<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `501f80b` against base `fe514bc`.

**Total median wall time:** 14.51s -> 10.20s (-29.7%, 1.42x speedup)
**Compiler ready median:** 12.97s -> 8.54s (-34.1%)
**Route load median:** 1.61s -> 1.61s (+0.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 14.51s | 10.20s | -29.7% | 8.54s | 1.61s | 1.42x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334133594)

