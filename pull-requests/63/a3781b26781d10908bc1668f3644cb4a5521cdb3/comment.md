<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a3781b2` against base `7fe442c`.

**Total median wall time:** 9.77s -> 9.72s (-0.5%, 1.01x speedup)
**Compiler ready median:** 9.77s -> 9.72s (-0.5%)
**Route load median:** 1.96s -> 1.99s (+1.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.77s | 9.72s | -0.5% | 9.72s | 1.99s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28338833079)

