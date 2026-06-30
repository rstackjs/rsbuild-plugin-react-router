<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `13c1a6c` against base `b322159`.

**Total median wall time:** 11.87s -> 11.60s (-2.2%, 1.02x speedup)
**Compiler ready median:** 9.76s -> 9.52s (-2.5%)
**Route load median:** 2.02s -> 2.01s (-0.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.87s | 11.60s | -2.2% | 9.52s | 2.01s | 1.02x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28418597519)

