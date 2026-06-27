<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `84caf8e` against base `2d960ac`.

**Total median wall time:** 11.74s -> 10.51s (-10.4%, 1.12x speedup)
**Compiler ready median:** 9.72s -> 8.41s (-13.5%)
**Route load median:** 1.95s -> 1.97s (+1.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.74s | 10.51s | -10.4% | 8.41s | 1.97s | 1.12x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28299713123)

