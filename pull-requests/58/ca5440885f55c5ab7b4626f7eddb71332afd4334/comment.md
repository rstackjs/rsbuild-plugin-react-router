<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ca54408` against base `3f6db5c`.

**Total median wall time:** 12.03s -> 11.83s (-1.7%, 1.02x speedup)
**Compiler ready median:** 9.90s -> 9.77s (-1.3%)
**Route load median:** 2.02s -> 2.00s (-0.8%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.03s | 11.83s | -1.7% | 9.77s | 2.00s | 1.02x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28394819108)

