<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `bca8122` against base `b322159`.

**Total median wall time:** 11.79s -> 11.92s (+1.1%, 0.99x speedup)
**Compiler ready median:** 9.66s -> 9.81s (+1.5%)
**Route load median:** 2.05s -> 2.05s (+0.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.79s | 11.92s | +1.1% | 9.81s | 2.05s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28418414018)

