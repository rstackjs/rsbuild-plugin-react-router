<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2d960ac` against base `470c3c8`.

**Total median wall time:** 11.52s -> 11.77s (+2.1%, 0.98x speedup)
**Compiler ready median:** 9.47s -> 9.72s (+2.7%)
**Route load median:** 1.99s -> 1.96s (-1.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.52s | 11.77s | +2.1% | 9.72s | 1.96s | 0.98x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28279014893)

