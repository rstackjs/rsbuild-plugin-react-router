<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `bf006e0` against base `b322159`.

**Total median wall time:** 9.02s -> 8.35s (-7.4%, 1.08x speedup)
**Compiler ready median:** 9.02s -> 8.35s (-7.4%)
**Route load median:** 1.84s -> 1.86s (+1.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.02s | 8.35s | -7.4% | 8.35s | 1.86s | 1.08x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28408888842)

