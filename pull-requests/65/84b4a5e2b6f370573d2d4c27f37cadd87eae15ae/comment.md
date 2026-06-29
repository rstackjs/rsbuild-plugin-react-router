<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `84b4a5e` against base `31e5bf5`.

**Total median wall time:** 15.94s -> 16.21s (+1.7%, 0.98x speedup)
**Compiler ready median:** 14.02s -> 14.22s (+1.4%)
**Route load median:** 1.86s -> 1.89s (+1.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 15.94s | 16.21s | +1.7% | 14.22s | 1.89s | 0.98x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28342592442)

