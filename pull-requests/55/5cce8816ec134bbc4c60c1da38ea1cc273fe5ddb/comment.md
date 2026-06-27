<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `5cce881` against base `2d960ac`.

**Total median wall time:** 11.86s -> 12.06s (+1.7%, 0.98x speedup)
**Compiler ready median:** 9.87s -> 10.05s (+1.8%)
**Route load median:** 1.94s -> 1.95s (+0.9%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.86s | 12.06s | +1.7% | 10.05s | 1.95s | 0.98x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28280723966)

