<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `9bb4400` against base `77da11d`.

**Total median wall time:** 8.69s -> 8.59s (-1.2%, 1.01x speedup)
**Compiler ready median:** 8.69s -> 8.59s (-1.2%)
**Route load median:** 1.98s -> 1.97s (-1.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 8.69s | 8.59s | -1.2% | 8.59s | 1.97s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28417986368)

