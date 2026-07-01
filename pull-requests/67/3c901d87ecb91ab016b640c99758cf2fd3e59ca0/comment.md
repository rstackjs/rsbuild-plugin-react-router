<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `3c901d8` against base `3d3d54a`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 32.27s | 31.47s | -2.5% | 20.88s | 20.57s | -1.5% | 4.02s | 3.95s | -1.8% | 3.59s | 3.27s | -8.9% | 1.03x |
| Large app | 1 | 14.85s | 14.83s | -0.2% | 8.83s | 8.77s | -0.7% | 2.05s | 2.02s | -1.6% | 2.15s | 2.13s | -1.2% | 1.00x |
| Standard fixtures | 6 | 17.42s | 16.64s | -4.5% | 12.05s | 11.81s | -2.0% | 1.96s | 1.92s | -2.0% | 1.44s | 1.14s | -20.6% | 1.05x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.85s | 9.70s | -1.5% | 9.67s | 9.95s | 1.02x | 1548 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.90s | 4.57s | -6.7% | 4.61s | 4.77s | 1.07x | 636 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 6.34s | 5.84s | -7.8% | 5.84s | 6.05s | 1.08x | 820 MB |
| `synthetic-256-sourcemaps` | 10 | 3.00s | 2.84s | -5.1% | 2.87s | 3.09s | 1.05x | 499 MB |
| `synthetic-256-ssr-esm` | 10 | 2.86s | 2.76s | -3.2% | 2.78s | 2.95s | 1.03x | 458 MB |
| `synthetic-256-ssr-esm-split` | 10 | 3.28s | 3.14s | -4.2% | 3.14s | 3.29s | 1.04x | 494 MB |
| `synthetic-48-ssr-esm` | 10 | 1.91s | 1.84s | -4.0% | 1.88s | 2.24s | 1.04x | 346 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.85s | 14.83s | -0.2% | 8.83s | 8.77s | 2.05s | 2.02s | 2.15s | 2.13s | -1.2% | 14.76s | 14.96s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.76s | 4.51s | -5.3% | 3.11s | 3.04s | 0.55s | 0.55s | 0.48s | 0.38s | -20.4% | 4.51s | 4.59s | 1.06x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.86s | 4.53s | -6.7% | 3.15s | 3.08s | 0.55s | 0.54s | 0.50s | 0.38s | -24.7% | 4.53s | 4.61s | 1.07x | - |
| `synthetic-256-sourcemaps` | 10 | 2.38s | 2.34s | -1.6% | 1.79s | 1.76s | 0.25s | 0.23s | 0.15s | 0.13s | -16.4% | 2.33s | 2.38s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 2.15s | 2.09s | -2.7% | 1.58s | 1.55s | 0.24s | 0.24s | 0.13s | 0.10s | -19.9% | 2.09s | 2.17s | 1.03x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.18s | 2.09s | -4.2% | 1.60s | 1.55s | 0.24s | 0.24s | 0.13s | 0.10s | -19.0% | 2.08s | 2.14s | 1.04x | - |
| `synthetic-48-ssr-esm` | 10 | 1.10s | 1.09s | -1.0% | 0.82s | 0.83s | 0.13s | 0.13s | 0.05s | 0.05s | +0.5% | 1.09s | 1.14s | 1.01x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 115.18s | 105.82s | -8.1% | 105.82s | - | 1.09x | - |
| complex app | 2 | 106.31s | 102.14s | -3.9% | 102.14s | - | 1.04x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 86.85s | 85.37s | -1.7% | 77.50s | 75.98s | 2.78s | 2.73s | 4.29s | 4.40s | +2.5% | 85.37s | - | 1.02x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28488315267)

