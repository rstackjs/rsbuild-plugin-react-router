<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `06ce3b3` against base `b35fdf5`.

**Total median wall time:** 12.25s -> 12.18s (-0.6%, 1.01x speedup)
**Compiler ready median:** 10.09s -> 10.01s (-0.8%)
**Route load median:** 2.12s -> 2.10s (-1.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.25s | 12.18s | -0.6% | 10.01s | 2.10s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28328633656)

