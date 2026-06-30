<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `bdd230a` against base `5787480`.

**Total median wall time:** 9.09s -> 9.01s (-0.8%, 1.01x speedup)
**Compiler ready median:** 9.09s -> 9.01s (-0.8%)
**Route load median:** 2.05s -> 2.06s (+0.6%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.09s | 9.01s | -0.8% | 9.01s | 2.06s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28417970608)

