<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `dcebfbb` against base `6c6000b`.

**Total median wall time:** 9.80s -> 9.84s (+0.4%, 1.00x speedup)
**Compiler ready median:** 9.80s -> 9.84s (+0.4%)
**Route load median:** 2.01s -> 2.01s (-0.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.80s | 9.84s | +0.4% | 9.84s | 2.01s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28342347482)

