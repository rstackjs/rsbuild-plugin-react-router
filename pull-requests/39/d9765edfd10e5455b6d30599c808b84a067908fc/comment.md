<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d9765ed` against base `0287c14`.

**Total median wall time:** 17.84s -> 11.84s (-33.6%, 1.51x speedup)
**Compiler ready median:** 15.68s -> 9.84s (-37.3%)
**Route load median:** 2.06s -> 1.97s (-4.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.84s | 11.84s | -33.6% | 9.84s | 1.97s | 1.51x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28348213686)

