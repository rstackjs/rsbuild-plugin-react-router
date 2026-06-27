<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `04f4572` against base `470c3c8`.

**Total median wall time:** 11.98s -> 12.16s (+1.4%, 0.99x speedup)
**Compiler ready median:** 9.83s -> 10.07s (+2.4%)
**Route load median:** 2.08s -> 2.01s (-3.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.98s | 12.16s | +1.4% | 10.07s | 2.01s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28276866443)

