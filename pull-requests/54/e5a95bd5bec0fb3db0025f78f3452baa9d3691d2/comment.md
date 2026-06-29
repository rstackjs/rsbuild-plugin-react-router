<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e5a95bd` against base `b322159`.

**Total median wall time:** 9.89s -> 9.18s (-7.2%, 1.08x speedup)
**Compiler ready median:** 9.89s -> 9.18s (-7.2%)
**Route load median:** 2.01s -> 2.08s (+3.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.89s | 9.18s | -7.2% | 9.18s | 2.08s | 1.08x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28406461081)

