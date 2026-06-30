<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `77da11d` against base `bdd230a`.

**Total median wall time:** 9.28s -> 9.05s (-2.5%, 1.03x speedup)
**Compiler ready median:** 9.28s -> 9.05s (-2.5%)
**Route load median:** 2.10s -> 2.07s (-1.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.28s | 9.05s | -2.5% | 9.05s | 2.07s | 1.03x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28417971072)

