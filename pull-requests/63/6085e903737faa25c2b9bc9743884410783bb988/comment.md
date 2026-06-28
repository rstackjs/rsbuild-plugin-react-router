<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `6085e90` against base `06ce3b3`.

**Total median wall time:** 11.90s -> 12.07s (+1.4%, 0.99x speedup)
**Compiler ready median:** 9.79s -> 9.90s (+1.2%)
**Route load median:** 2.07s -> 2.09s (+1.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.90s | 12.07s | +1.4% | 9.90s | 2.09s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334188060)

