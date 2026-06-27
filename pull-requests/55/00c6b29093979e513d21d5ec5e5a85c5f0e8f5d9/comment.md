<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `00c6b29` against base `04f4572`.

**Total median wall time:** 11.19s -> 11.28s (+0.8%, 0.99x speedup)
**Compiler ready median:** 9.33s -> 9.41s (+0.9%)
**Route load median:** 1.80s -> 1.79s (-0.2%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.19s | 11.28s | +0.8% | 9.41s | 1.79s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28276879233)

