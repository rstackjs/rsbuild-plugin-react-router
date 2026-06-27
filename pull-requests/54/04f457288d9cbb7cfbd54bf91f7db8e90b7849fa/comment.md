<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `04f4572` against base `470c3c8`.

**Total median wall time:** 12.13s -> 12.21s (+0.6%, 0.99x speedup)
**Compiler ready median:** 10.01s -> 10.12s (+1.1%)
**Route load median:** 2.07s -> 2.02s (-2.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.13s | 12.21s | +0.6% | 10.12s | 2.02s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28276866443)

