<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `6c6000b` against base `a3781b2`.

**Total median wall time:** 9.74s -> 9.58s (-1.6%, 1.02x speedup)
**Compiler ready median:** 9.74s -> 9.58s (-1.6%)
**Route load median:** 1.97s -> 1.95s (-1.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.74s | 9.58s | -1.6% | 9.58s | 1.95s | 1.02x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28338862689)

