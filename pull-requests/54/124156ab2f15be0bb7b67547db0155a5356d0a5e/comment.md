<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `124156a` against base `470c3c8`.

**Total median wall time:** 8.55s -> 8.17s (-4.4%, 1.05x speedup)
**Compiler ready median:** 8.55s -> 8.17s (-4.4%)
**Route load median:** 1.58s -> 1.59s (+0.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 8.55s | 8.17s | -4.4% | 8.17s | 1.59s | 1.05x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334659129)

