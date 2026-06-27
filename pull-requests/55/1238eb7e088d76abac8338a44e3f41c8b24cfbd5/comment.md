<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1238eb7` against base `2d960ac`.

**Total median wall time:** 11.65s -> 10.54s (-9.5%, 1.11x speedup)
**Compiler ready median:** 9.69s -> 8.32s (-14.2%)
**Route load median:** 1.90s -> 2.16s (+14.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.65s | 10.54s | -9.5% | 8.32s | 2.16s | 1.11x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28281652165)

