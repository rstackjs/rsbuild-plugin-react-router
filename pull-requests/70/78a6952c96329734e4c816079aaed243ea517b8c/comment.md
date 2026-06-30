<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `78a6952` against base `b322159`.

**Total median wall time:** 12.18s -> 12.10s (-0.6%, 1.01x speedup)
**Compiler ready median:** 10.02s -> 9.97s (-0.5%)
**Route load median:** 2.10s -> 2.05s (-2.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.18s | 12.10s | -0.6% | 9.97s | 2.05s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28418237282)

