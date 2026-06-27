<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `65388f4` against base `2d960ac`.

**Total median wall time:** 12.04s -> 10.78s (-10.5%, 1.12x speedup)
**Compiler ready median:** 9.95s -> 8.59s (-13.7%)
**Route load median:** 2.02s -> 2.03s (+0.6%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.04s | 10.78s | -10.5% | 8.59s | 2.03s | 1.12x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28283511200)

