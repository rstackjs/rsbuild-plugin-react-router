<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `356b2bb` against base `2d960ac`.

**Total median wall time:** 11.89s -> 10.55s (-11.3%, 1.13x speedup)
**Compiler ready median:** 9.85s -> 8.42s (-14.5%)
**Route load median:** 1.98s -> 1.99s (+0.7%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.89s | 10.55s | -11.3% | 8.42s | 1.99s | 1.13x | - |

Profile: `large`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28283685624)

