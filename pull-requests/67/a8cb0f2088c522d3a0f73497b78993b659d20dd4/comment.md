<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a8cb0f2` against base `6c6000b`.

**Total median wall time:** 9.79s -> 9.72s (-0.7%, 1.01x speedup)
**Compiler ready median:** 9.79s -> 9.72s (-0.7%)
**Route load median:** 2.01s -> 1.97s (-2.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.79s | 9.72s | -0.7% | 9.72s | 1.97s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28347836504)

