<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `b2ba548` against base `c4b6d8b`.

**Total median wall time:** 12.20s -> 12.26s (+0.5%, 1.00x speedup)
**Compiler ready median:** 10.08s -> 10.08s (+0.0%)
**Route load median:** 2.11s -> 2.10s (-0.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.20s | 12.26s | +0.5% | 10.08s | 2.10s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28420030718)

