<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `3c4ec9c` against base `2d960ac`.

**Total median wall time:** 10.63s -> 9.66s (-9.1%, 1.10x speedup)
**Compiler ready median:** 8.84s -> 7.76s (-12.3%)
**Route load median:** 1.76s -> 1.79s (+1.6%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 10.63s | 9.66s | -9.1% | 7.76s | 1.79s | 1.10x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28299596150)

