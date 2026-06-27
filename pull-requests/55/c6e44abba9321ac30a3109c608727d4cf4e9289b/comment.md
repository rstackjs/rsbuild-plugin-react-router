<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c6e44ab` against base `2d960ac`.

**Total median wall time:** 11.81s -> 11.00s (-6.9%, 1.07x speedup)
**Compiler ready median:** 9.80s -> 8.50s (-13.3%)
**Route load median:** 1.97s -> 2.41s (+22.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.81s | 11.00s | -6.9% | 8.50s | 2.41s | 1.07x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28281751228)

