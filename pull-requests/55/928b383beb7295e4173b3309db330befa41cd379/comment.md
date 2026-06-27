<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `928b383` against base `2d960ac`.

**Total median wall time:** 11.08s -> 10.03s (-9.5%, 1.11x speedup)
**Compiler ready median:** 9.20s -> 8.04s (-12.6%)
**Route load median:** 1.83s -> 1.85s (+1.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.08s | 10.03s | -9.5% | 8.04s | 1.85s | 1.11x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28283806366)

