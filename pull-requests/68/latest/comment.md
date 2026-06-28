<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `26447d5` against base `6c6000b`.

**Total median wall time:** 9.53s -> 9.49s (-0.4%, 1.00x speedup)
**Compiler ready median:** 9.53s -> 9.49s (-0.4%)
**Route load median:** 1.98s -> 1.97s (-0.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.53s | 9.49s | -0.4% | 9.49s | 1.97s | 1.00x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28340142538)

