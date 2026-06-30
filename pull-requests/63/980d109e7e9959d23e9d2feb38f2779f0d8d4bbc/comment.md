<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `980d109` against base `7982f17`.

**Total median wall time:** 9.17s -> 9.10s (-0.8%, 1.01x speedup)
**Compiler ready median:** 9.17s -> 9.10s (-0.8%)
**Route load median:** 2.08s -> 2.06s (-1.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.17s | 9.10s | -0.8% | 9.10s | 2.06s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28414793201)

