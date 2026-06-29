<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ecac898` against base `0287c14`.

**Total median wall time:** 17.97s -> 11.93s (-33.7%, 1.51x speedup)
**Compiler ready median:** 15.81s -> 9.92s (-37.3%)
**Route load median:** 2.06s -> 1.99s (-3.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.97s | 11.93s | -33.7% | 9.92s | 1.99s | 1.51x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28343781318)

