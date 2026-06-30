<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `785ce8b` against base `980d109`.

**Total median wall time:** 8.44s -> 8.28s (-1.8%, 1.02x speedup)
**Compiler ready median:** 8.44s -> 8.28s (-1.8%)
**Route load median:** 1.89s -> 1.89s (-0.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 8.44s | 8.28s | -1.8% | 8.28s | 1.89s | 1.02x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28414821411)

