<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `f78a0b2` against base `b322159`.

**Total median wall time:** 10.03s -> 10.17s (+1.4%, 0.99x speedup)
**Compiler ready median:** 10.03s -> 10.17s (+1.4%)
**Route load median:** 2.11s -> 2.11s (+0.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 10.03s | 10.17s | +1.4% | 10.17s | 2.11s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28396509243)

