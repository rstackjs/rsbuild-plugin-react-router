<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `5787480` against base `9519de0`.

**Total median wall time:** 9.58s -> 9.69s (+1.2%, 0.99x speedup)
**Compiler ready median:** 9.58s -> 9.69s (+1.2%)
**Route load median:** 2.20s -> 2.21s (+0.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.58s | 9.69s | +1.2% | 9.69s | 2.21s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28417839523)

