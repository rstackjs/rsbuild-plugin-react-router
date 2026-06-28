<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `44a6cad` against base `61f451e`.

**Total median wall time:** 14.03s -> 9.44s (-32.8%, 1.49x speedup)
**Compiler ready median:** 12.58s -> 7.89s (-37.3%)
**Route load median:** 1.47s -> 1.48s (+0.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 14.03s | 9.44s | -32.8% | 7.89s | 1.48s | 1.49x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28338727486)

