<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ad3663f` against base `06ae3db`.

**Total median wall time:** 15.84s -> 16.75s (+5.7%, 0.95x speedup)
**Compiler ready median:** 13.85s -> 14.63s (+5.6%)
**Route load median:** 1.91s -> 1.87s (-2.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 15.84s | 16.75s | +5.7% | 14.63s | 1.87s | 0.95x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28275666338)

