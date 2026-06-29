<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1d8ded2` against base `b322159`.

**Total median wall time:** 9.25s -> 8.50s (-8.1%, 1.09x speedup)
**Compiler ready median:** 9.25s -> 8.50s (-8.1%)
**Route load median:** 1.88s -> 1.90s (+0.8%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.25s | 8.50s | -8.1% | 8.50s | 1.90s | 1.09x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28409495803)

