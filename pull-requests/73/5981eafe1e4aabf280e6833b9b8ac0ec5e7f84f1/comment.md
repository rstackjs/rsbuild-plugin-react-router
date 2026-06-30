<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `5981eaf` against base `0f9b463`.

**Total median wall time:** 11.85s -> 11.67s (-1.5%, 1.02x speedup)
**Compiler ready median:** 9.77s -> 9.66s (-1.2%)
**Route load median:** 2.02s -> 1.96s (-3.0%)

| Benchmark | Base total | Head total | Delta | Head ready | Head routes | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 11.85s | 11.67s | -1.5% | 9.66s | 1.96s | 1.02x | - |

### Synthetic Rsbuild App

| Benchmark | Profile | Base median | Head median | Delta | Speedup | Runs |
|---|---:|---:|---:|---:|---:|---:|
| complex app | `cold` | 101.13s | 101.28s | +0.1% | 1.00x | 1 |

Profile: `large`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28465705221)

