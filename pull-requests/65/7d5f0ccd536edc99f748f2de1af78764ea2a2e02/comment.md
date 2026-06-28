<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `7d5f0cc` against base `fe514bc`.

**Total median wall time:** 17.66s -> 17.69s (+0.2%, 1.00x speedup)
**Compiler ready median:** 15.47s -> 15.55s (+0.5%)
**Route load median:** 2.04s -> 2.04s (+0.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 17.66s | 17.69s | +0.2% | 15.55s | 2.04s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28337342957)

