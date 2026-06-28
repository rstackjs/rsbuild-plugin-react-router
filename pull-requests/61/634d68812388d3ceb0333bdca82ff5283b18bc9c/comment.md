<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `634d688` against base `6a49a94`.

**Total median wall time:** 11.56s -> 11.59s (+0.3%, 1.00x speedup)
**Compiler ready median:** 9.47s -> 9.52s (+0.5%)
**Route load median:** 2.03s -> 2.03s (-0.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.56s | 11.59s | +0.3% | 9.52s | 2.03s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28328685068)

