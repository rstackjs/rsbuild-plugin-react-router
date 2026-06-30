<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c85830c` against base `0f9b463`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.35s | 32.05s | +2.2% | 21.79s | 22.13s | +1.6% | 4.15s | 4.32s | +4.0% | 2.96s | 3.11s | +5.0% | 0.98x |
| Large app | 1 | 14.89s | 15.28s | +2.6% | 9.77s | 9.91s | +1.4% | 2.03s | 2.03s | +0.3% | 1.61s | 1.69s | +5.0% | 0.97x |
| Standard fixtures | 6 | 16.46s | 16.77s | +1.9% | 12.01s | 12.21s | +1.7% | 2.12s | 2.28s | +7.6% | 1.35s | 1.42s | +4.9% | 0.98x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.77s | 9.21s | +5.0% | 9.26s | 9.55s | 0.95x | 1503 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.32s | 4.29s | -0.7% | 4.33s | 4.53s | 1.01x | 607 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.80s | 5.89s | +1.5% | 5.82s | 6.00s | 0.98x | 781 MB |
| `synthetic-256-sourcemaps` | 10 | 2.35s | 2.34s | -0.6% | 2.35s | 2.47s | 1.01x | 447 MB |
| `synthetic-256-ssr-esm` | 10 | 2.17s | 2.19s | +1.0% | 2.20s | 2.33s | 0.99x | 412 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.57s | 2.59s | +0.8% | 2.60s | 2.78s | 0.99x | 435 MB |
| `synthetic-48-ssr-esm` | 10 | 1.55s | 1.54s | -0.2% | 1.57s | 1.80s | 1.00x | 311 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.89s | 15.28s | +2.6% | 9.77s | 9.91s | 2.03s | 2.03s | 1.61s | 1.69s | +5.0% | 15.40s | 16.51s | 0.97x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.65s | 4.79s | +2.9% | 3.42s | 3.50s | 0.53s | 0.59s | 0.46s | 0.46s | +0.1% | 4.84s | 5.13s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.64s | 4.81s | +3.5% | 3.39s | 3.51s | 0.53s | 0.56s | 0.45s | 0.48s | +5.7% | 4.87s | 5.23s | 0.97x | - |
| `synthetic-256-sourcemaps` | 10 | 2.21s | 2.23s | +0.9% | 1.66s | 1.68s | 0.28s | 0.29s | 0.13s | 0.15s | +18.4% | 2.23s | 2.30s | 0.99x | - |
| `synthetic-256-ssr-esm` | 10 | 1.96s | 1.97s | +0.6% | 1.40s | 1.39s | 0.32s | 0.34s | 0.13s | 0.13s | +1.4% | 1.98s | 2.04s | 0.99x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.97s | 1.96s | -0.3% | 1.40s | 1.40s | 0.31s | 0.35s | 0.13s | 0.13s | -1.5% | 1.97s | 2.06s | 1.00x | - |
| `synthetic-48-ssr-esm` | 10 | 1.03s | 1.02s | -1.2% | 0.74s | 0.72s | 0.15s | 0.15s | 0.06s | 0.08s | +28.3% | 1.02s | 1.12s | 1.01x | - |

### Synthetic Rsbuild App

Rendered 1 production build benchmark.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 1 | 98.23s | 110.42s | +12.4% | 110.42s | - | 0.89x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 1 | 83.68s | 95.11s | +13.7% | 75.35s | 85.91s | 2.98s | 3.25s | 3.18s | 3.63s | +14.1% | 95.11s | - | 0.88x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28481030909)

