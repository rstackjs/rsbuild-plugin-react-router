<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2bf94fc` against base `470c3c8`.

**Total median wall time:** 12.01s -> 12.20s (+1.6%, 0.98x speedup)
**Compiler ready median:** 9.87s -> 10.12s (+2.6%)
**Route load median:** 2.11s -> 2.04s (-3.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.01s | 12.20s | +1.6% | 10.12s | 2.04s | 0.98x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28278149787)

