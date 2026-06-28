<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c6546d4` against base `fe514bc`.

**Total median wall time:** 16.35s -> 16.20s (-0.9%, 1.01x speedup)
**Compiler ready median:** 14.13s -> 14.21s (+0.6%)
**Route load median:** 2.04s -> 1.94s (-4.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 16.35s | 16.20s | -0.9% | 14.21s | 1.94s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334239730)

