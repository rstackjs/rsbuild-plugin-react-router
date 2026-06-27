<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a0853da` against base `06ae3db`.

**Total median wall time:** 17.58s -> 11.88s (-32.4%, 1.48x speedup)
**Compiler ready median:** 15.43s -> 9.75s (-36.8%)
**Route load median:** 2.04s -> 2.06s (+1.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.58s | 11.88s | -32.4% | 9.75s | 2.06s | 1.48x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28275425287)

