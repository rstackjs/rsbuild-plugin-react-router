<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0c1f1e5` against base `470c3c8`.

**Total median wall time:** 12.18s -> 12.28s (+0.8%, 0.99x speedup)
**Compiler ready median:** 9.98s -> 10.20s (+2.2%)
**Route load median:** 2.11s -> 2.01s (-4.6%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.18s | 12.28s | +0.8% | 10.20s | 2.01s | 0.99x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28276373791)

