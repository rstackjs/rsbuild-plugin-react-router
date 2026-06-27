<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `198112e` against base `2d960ac`.

**Total median wall time:** 12.10s -> 10.84s (-10.4%, 1.12x speedup)
**Compiler ready median:** 10.03s -> 8.44s (-15.9%)
**Route load median:** 1.98s -> 2.28s (+15.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.10s | 10.84s | -10.4% | 8.44s | 2.28s | 1.12x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28281854794)

