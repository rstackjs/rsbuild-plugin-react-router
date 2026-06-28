<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `6a49a94` against base `06ce3b3`.

**Total median wall time:** 11.68s -> 11.82s (+1.2%, 0.99x speedup)
**Compiler ready median:** 9.62s -> 9.74s (+1.2%)
**Route load median:** 2.01s -> 2.03s (+1.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.68s | 11.82s | +1.2% | 9.74s | 2.03s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28328666494)

