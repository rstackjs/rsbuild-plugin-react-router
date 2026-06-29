<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `bb29cd6` against base `b322159`.

**Total median wall time:** 9.10s -> 8.36s (-8.1%, 1.09x speedup)
**Compiler ready median:** 9.10s -> 8.36s (-8.1%)
**Route load median:** 1.85s -> 1.83s (-1.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.10s | 8.36s | -8.1% | 8.36s | 1.83s | 1.09x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28410316820)

