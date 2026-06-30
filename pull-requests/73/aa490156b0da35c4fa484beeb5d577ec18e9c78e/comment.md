<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `aa49015` against base `0f9b463`.

**Total median wall time:** 12.01s -> 12.12s (+0.9%, 0.99x speedup)
**Compiler ready median:** 9.92s -> 10.02s (+1.0%)
**Route load median:** 2.03s -> 2.03s (+0.3%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 12.01s | 12.12s | +0.9% | 10.02s | 2.03s | 0.99x | - |

### Synthetic Rsbuild App

| Benchmark | Profile | Base median | Head median | Delta | Speedup | Runs |
|---|---:|---:|---:|---:|---:|---:|
| complex app | `cold` | 106.63s | 102.60s | -3.8% | 1.04x | 1 |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28466171944)

