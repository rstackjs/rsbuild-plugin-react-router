<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `88aa4ec` against base `b0a7155`.

**Total median wall time:** 11.65s -> 11.63s (-0.2%, 1.00x speedup)
**Compiler ready median:** 9.58s -> 9.54s (-0.4%)
**Route load median:** 2.01s -> 2.01s (+0.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.65s | 11.63s | -0.2% | 9.54s | 2.01s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28280723972)

