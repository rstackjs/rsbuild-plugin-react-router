<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1d5b9b4` against base `2d960ac`.

**Total median wall time:** 10.77s -> 9.87s (-8.4%, 1.09x speedup)
**Compiler ready median:** 8.96s -> 7.82s (-12.7%)
**Route load median:** 1.78s -> 2.00s (+12.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 10.77s | 9.87s | -8.4% | 7.82s | 2.00s | 1.09x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28281410193)

