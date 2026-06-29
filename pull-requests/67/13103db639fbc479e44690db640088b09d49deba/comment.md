<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `13103db` against base `6c6000b`.

**Total median wall time:** 9.77s -> 9.67s (-1.0%, 1.01x speedup)
**Compiler ready median:** 9.77s -> 9.67s (-1.0%)
**Route load median:** 1.98s -> 1.99s (+0.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.77s | 9.67s | -1.0% | 9.67s | 1.99s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28341800447)

