<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `8b08bd7` against base `62a5061`.

**Total median wall time:** 12.42s -> 12.23s (-1.6%, 1.02x speedup)
**Compiler ready median:** 10.18s -> 10.09s (-0.9%)
**Route load median:** 2.18s -> 2.10s (-3.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.42s | 12.23s | -1.6% | 10.09s | 2.10s | 1.02x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334202058)

