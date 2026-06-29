<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `82b4255` against base `f78a0b2`.

**Total median wall time:** 10.15s -> 9.03s (-11.1%, 1.12x speedup)
**Compiler ready median:** 10.15s -> 9.03s (-11.1%)
**Route load median:** 2.11s -> 2.05s (-2.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 10.15s | 9.03s | -11.1% | 9.03s | 2.05s | 1.12x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28398150389)

