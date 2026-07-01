<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `6d6fe0b` against base `0f9b463`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.62s | 31.62s | -0.0% | 21.97s | 21.96s | -0.0% | 4.20s | 4.22s | +0.5% | 3.09s | 2.96s | -4.1% | 1.00x |
| Large app | 1 | 14.92s | 14.95s | +0.2% | 9.78s | 9.86s | +0.8% | 2.02s | 2.03s | +0.2% | 1.65s | 1.62s | -1.9% | 1.00x |
| Standard fixtures | 6 | 16.70s | 16.67s | -0.2% | 12.19s | 12.10s | -0.7% | 2.18s | 2.19s | +0.9% | 1.44s | 1.34s | -6.7% | 1.00x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.89s | 8.86s | -0.3% | 8.90s | 9.13s | 1.00x | 1516 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.25s | 4.38s | +2.9% | 4.34s | 4.49s | 0.97x | 616 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.94s | 5.72s | -3.8% | 5.73s | 5.93s | 1.04x | 787 MB |
| `synthetic-256-sourcemaps` | 10 | 2.35s | 2.30s | -2.2% | 2.31s | 2.43s | 1.02x | 434 MB |
| `synthetic-256-ssr-esm` | 10 | 2.18s | 2.16s | -1.0% | 2.18s | 2.38s | 1.01x | 399 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.57s | 2.57s | +0.0% | 2.59s | 2.74s | 1.00x | 433 MB |
| `synthetic-48-ssr-esm` | 10 | 1.54s | 1.54s | +0.2% | 1.56s | 1.75s | 1.00x | 312 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.92s | 14.95s | +0.2% | 9.78s | 9.86s | 2.02s | 2.03s | 1.65s | 1.62s | -1.9% | 14.97s | 15.13s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.73s | 4.73s | +0.1% | 3.50s | 3.43s | 0.54s | 0.53s | 0.45s | 0.45s | +0.1% | 4.72s | 4.81s | 1.00x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.70s | 4.81s | +2.4% | 3.45s | 3.54s | 0.55s | 0.55s | 0.48s | 0.45s | -4.8% | 4.75s | 4.92s | 0.98x | - |
| `synthetic-256-sourcemaps` | 10 | 2.25s | 2.18s | -3.3% | 1.69s | 1.64s | 0.28s | 0.27s | 0.15s | 0.13s | -15.6% | 2.19s | 2.29s | 1.03x | - |
| `synthetic-256-ssr-esm` | 10 | 2.01s | 1.99s | -1.0% | 1.43s | 1.40s | 0.33s | 0.35s | 0.13s | 0.13s | -2.3% | 1.99s | 2.05s | 1.01x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.96s | 1.96s | +0.1% | 1.37s | 1.39s | 0.32s | 0.34s | 0.15s | 0.13s | -16.0% | 1.97s | 2.03s | 1.00x | - |
| `synthetic-48-ssr-esm` | 10 | 1.05s | 1.00s | -4.5% | 0.76s | 0.70s | 0.15s | 0.16s | 0.08s | 0.05s | -29.6% | 1.00s | 1.05s | 1.05x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.79s | 101.26s | +2.5% | 101.26s | - | 0.98x | - |
| complex app | 2 | 100.52s | 99.54s | -1.0% | 99.54s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 84.43s | 85.67s | +1.5% | 75.79s | 76.76s | 2.97s | 3.09s | 3.25s | 3.31s | +1.9% | 85.67s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28484528914)

