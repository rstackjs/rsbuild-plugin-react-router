<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `62fbb12` against base `6c6000b`.

**Total median wall time:** 9.56s -> 9.45s (-1.1%, 1.01x speedup)
**Compiler ready median:** 9.56s -> 9.45s (-1.1%)
**Route load median:** 1.97s -> 1.94s (-1.8%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 9.56s | 9.45s | -1.1% | 9.45s | 1.94s | 1.01x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28340051867)

