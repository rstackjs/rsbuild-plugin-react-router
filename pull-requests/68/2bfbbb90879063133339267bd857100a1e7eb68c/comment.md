<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2bfbbb9` against base `2637c14`.

**Total median wall time:** 9.74s -> 9.62s (-1.3%, 1.01x speedup)
**Compiler ready median:** 9.74s -> 9.62s (-1.3%)
**Route load median:** 1.99s -> 2.00s (+0.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.74s | 9.62s | -1.3% | 9.62s | 2.00s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28398434203)

