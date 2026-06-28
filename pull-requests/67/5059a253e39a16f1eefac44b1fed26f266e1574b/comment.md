<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `5059a25` against base `6c6000b`.

**Total median wall time:** 9.95s -> 9.80s (-1.5%, 1.01x speedup)
**Compiler ready median:** 9.95s -> 9.80s (-1.5%)
**Route load median:** 2.05s -> 2.03s (-0.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.95s | 9.80s | -1.5% | 9.80s | 2.03s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28340250282)

