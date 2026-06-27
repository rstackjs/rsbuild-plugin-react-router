<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `fc6d873` against base `2d960ac`.

**Total median wall time:** 11.88s -> 10.49s (-11.7%, 1.13x speedup)
**Compiler ready median:** 9.86s -> 8.37s (-15.1%)
**Route load median:** 1.96s -> 1.97s (+0.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.88s | 10.49s | -11.7% | 8.37s | 1.97s | 1.13x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28282301497)

