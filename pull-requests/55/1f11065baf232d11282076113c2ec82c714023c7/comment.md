<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1f11065` against base `2d960ac`.

**Total median wall time:** 12.41s -> 11.45s (-7.7%, 1.08x speedup)
**Compiler ready median:** 10.24s -> 9.19s (-10.3%)
**Route load median:** 2.09s -> 2.10s (+0.6%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.41s | 11.45s | -7.7% | 9.19s | 2.10s | 1.08x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28300133807)

