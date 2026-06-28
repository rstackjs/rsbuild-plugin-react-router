<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `02bcedf` against base `b35fdf5`.

**Total median wall time:** 9.85s -> 9.11s (-7.5%, 1.08x speedup)
**Compiler ready median:** 8.23s -> 7.40s (-10.1%)
**Route load median:** 1.55s -> 1.59s (+2.4%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.85s | 9.11s | -7.5% | 7.40s | 1.59s | 1.08x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28334187899)

