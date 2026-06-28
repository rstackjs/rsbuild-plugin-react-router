<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `84fabd9` against base `d62c5f2`.

**Total median wall time:** 12.55s -> 12.19s (-2.8%, 1.03x speedup)
**Compiler ready median:** 10.39s -> 10.16s (-2.3%)
**Route load median:** 2.12s -> 2.09s (-1.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.55s | 12.19s | -2.8% | 10.16s | 2.09s | 1.03x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28338945105)

