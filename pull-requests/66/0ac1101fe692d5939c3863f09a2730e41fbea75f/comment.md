<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0ac1101` against base `fe514bc`.

**Total median wall time:** 16.62s -> 16.41s (-1.2%, 1.01x speedup)
**Compiler ready median:** 14.58s -> 14.40s (-1.2%)
**Route load median:** 1.91s -> 1.90s (-0.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 16.62s | 16.41s | -1.2% | 14.40s | 1.90s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28335056521)

