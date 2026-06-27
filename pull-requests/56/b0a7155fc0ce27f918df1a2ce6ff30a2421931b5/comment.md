<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `b0a7155` against base `470c3c8`.

**Total median wall time:** 11.72s -> 11.97s (+2.2%, 0.98x speedup)
**Compiler ready median:** 9.59s -> 9.85s (+2.7%)
**Route load median:** 2.07s -> 2.06s (-0.5%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.72s | 11.97s | +2.2% | 9.85s | 2.06s | 0.98x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28280723978)

