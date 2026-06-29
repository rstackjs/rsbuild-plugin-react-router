<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a2abe39` against base `95874ff`.

**Total median wall time:** 11.76s -> 12.15s (+3.3%, 0.97x speedup)
**Compiler ready median:** 9.68s -> 10.04s (+3.7%)
**Route load median:** 2.01s -> 2.01s (-0.1%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.76s | 12.15s | +3.3% | 10.04s | 2.01s | 0.97x | - |

Profile: `large`; mode: `dev`; iterations: `3`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28349444419)

