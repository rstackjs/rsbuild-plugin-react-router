<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `423843e` against base `c2450da`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 33.30s | 33.40s | +0.3% | 22.13s | 22.06s | -0.3% | 3.90s | 3.91s | +0.4% | 3.49s | 3.47s | -0.6% | 1.00x |
| Large app | 1 | 14.74s | 14.90s | +1.1% | 8.89s | 8.95s | +0.6% | 1.99s | 2.00s | +0.7% | 2.05s | 2.03s | -1.0% | 0.99x |
| Standard fixtures | 6 | 18.55s | 18.50s | -0.3% | 13.23s | 13.12s | -0.8% | 1.91s | 1.91s | +0.0% | 1.44s | 1.44s | +0.0% | 1.00x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.46s | 9.56s | +1.0% | 9.58s | 9.74s | 0.99x | 1548 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.93s | 4.91s | -0.5% | 4.91s | 5.05s | 1.00x | 630 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 6.25s | 6.27s | +0.4% | 6.23s | 6.54s | 1.00x | 803 MB |
| `synthetic-256-sourcemaps` | 10 | 2.91s | 2.89s | -0.7% | 2.89s | 3.05s | 1.01x | 491 MB |
| `synthetic-256-ssr-esm` | 10 | 2.78s | 2.77s | -0.7% | 2.78s | 2.94s | 1.01x | 446 MB |
| `synthetic-256-ssr-esm-split` | 10 | 3.21s | 3.19s | -0.7% | 3.20s | 3.36s | 1.01x | 483 MB |
| `synthetic-48-ssr-esm` | 10 | 1.80s | 1.79s | -0.8% | 1.82s | 2.16s | 1.01x | 336 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.74s | 14.90s | +1.1% | 8.89s | 8.95s | 1.99s | 2.00s | 2.05s | 2.03s | -1.0% | 14.87s | 14.91s | 0.99x | - |
| `synthetic-1024-ssr-esm` | 5 | 5.24s | 5.13s | -2.1% | 3.57s | 3.44s | 0.54s | 0.54s | 0.48s | 0.50s | +5.0% | 5.12s | 5.20s | 1.02x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 5.18s | 5.21s | +0.6% | 3.47s | 3.52s | 0.54s | 0.54s | 0.50s | 0.48s | -5.0% | 5.22s | 5.33s | 0.99x | - |
| `synthetic-256-sourcemaps` | 10 | 2.49s | 2.51s | +0.7% | 1.91s | 1.92s | 0.23s | 0.23s | 0.15s | 0.15s | +0.2% | 2.51s | 2.58s | 0.99x | - |
| `synthetic-256-ssr-esm` | 10 | 2.27s | 2.29s | +0.9% | 1.72s | 1.72s | 0.23s | 0.23s | 0.13s | 0.13s | +1.6% | 2.28s | 2.35s | 0.99x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.27s | 2.26s | -0.4% | 1.72s | 1.70s | 0.23s | 0.23s | 0.13s | 0.13s | -0.4% | 2.26s | 2.29s | 1.00x | - |
| `synthetic-48-ssr-esm` | 10 | 1.11s | 1.10s | -0.4% | 0.84s | 0.83s | 0.13s | 0.13s | 0.05s | 0.05s | -0.1% | 1.10s | 1.12s | 1.00x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 100.22s | 98.81s | -1.4% | 98.81s | - | 1.01x | - |
| complex app | 2 | 99.18s | 98.47s | -0.7% | 98.47s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 85.79s | 85.52s | -0.3% | 76.19s | 75.84s | 2.98s | 2.95s | 4.18s | 4.28s | +2.3% | 85.52s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28487458547)

