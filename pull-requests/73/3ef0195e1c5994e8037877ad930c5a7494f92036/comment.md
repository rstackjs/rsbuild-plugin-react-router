<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `3ef0195` against base `0f9b463`.

**Total median wall time:** 11.56s -> 11.58s (+0.2%, 1.00x speedup)
**Compiler ready median:** 9.50s -> 9.54s (+0.4%)
**Route load median:** 1.98s -> 1.98s (+0.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.56s | 11.58s | +0.2% | 9.54s | 1.98s | 1.00x | - |

### Synthetic Rsbuild App

| Benchmark | Profile | Base total | Head total | Delta | Head ready | Head routes | Head update/HMR | Speedup | Runs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | `cold` | 97.10s | 96.23s | -0.9% | - | - | - | 1.01x | 1 |
| complex app | `dev` | 83.84s | 84.07s | +0.3% | 75.81s | 2.96s | 3.15s | 1.00x | 1 |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28468635837)

