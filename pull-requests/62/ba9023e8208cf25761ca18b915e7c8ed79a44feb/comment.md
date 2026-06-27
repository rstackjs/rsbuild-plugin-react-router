<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ba9023e` against base `2d960ac`.

**Total median wall time:** 12.13s -> 11.99s (-1.1%, 1.01x speedup)
**Compiler ready median:** 10.02s -> 9.91s (-1.1%)
**Route load median:** 2.04s -> 2.01s (-1.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.13s | 11.99s | -1.1% | 9.91s | 2.01s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28280539525)

