<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `35d1a26` against base `6c6000b`.

**Total median wall time:** 10.18s -> 10.04s (-1.4%, 1.01x speedup)
**Compiler ready median:** 10.18s -> 10.04s (-1.4%)
**Route load median:** 2.09s -> 2.10s (+0.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 10.18s | 10.04s | -1.4% | 10.04s | 2.10s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28339841746)

