<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `7c0269c` against base `95874ff`.

**Total median wall time:** 11.84s -> 11.62s (-1.8%, 1.02x speedup)
**Compiler ready median:** 9.76s -> 9.55s (-2.2%)
**Route load median:** 1.99s -> 2.01s (+0.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.84s | 11.62s | -1.8% | 9.55s | 2.01s | 1.02x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28350849905)

