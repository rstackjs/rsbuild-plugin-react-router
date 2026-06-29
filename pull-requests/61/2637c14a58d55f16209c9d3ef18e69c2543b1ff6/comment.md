<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2637c14` against base `64f4bf6`.

**Total median wall time:** 9.84s -> 9.79s (-0.5%, 1.01x speedup)
**Compiler ready median:** 9.84s -> 9.79s (-0.5%)
**Route load median:** 2.03s -> 2.03s (-0.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.84s | 9.79s | -0.5% | 9.79s | 2.03s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28398377787)

