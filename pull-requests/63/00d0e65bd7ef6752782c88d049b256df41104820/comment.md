<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `00d0e65` against base `423843e`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 33.19s | 33.18s | -0.0% | 21.92s | 21.94s | +0.1% | 3.94s | 3.93s | -0.4% | 3.44s | 3.42s | -0.5% | 1.00x |
| Large app | 1 | 14.84s | 14.87s | +0.2% | 8.88s | 8.91s | +0.3% | 2.03s | 2.02s | -0.5% | 2.02s | 2.01s | -0.7% | 1.00x |
| Standard fixtures | 6 | 18.35s | 18.31s | -0.2% | 13.04s | 13.03s | -0.1% | 1.91s | 1.91s | -0.2% | 1.42s | 1.41s | -0.3% | 1.00x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.49s | 9.49s | -0.0% | 9.54s | 9.82s | 1.00x | 1567 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.96s | 4.81s | -3.1% | 4.84s | 5.07s | 1.03x | 625 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 6.23s | 6.31s | +1.4% | 6.32s | 6.47s | 0.99x | 794 MB |
| `synthetic-256-sourcemaps` | 10 | 2.90s | 2.91s | +0.5% | 2.92s | 3.10s | 1.00x | 482 MB |
| `synthetic-256-ssr-esm` | 10 | 2.86s | 2.77s | -3.0% | 2.79s | 3.04s | 1.03x | 442 MB |
| `synthetic-256-ssr-esm-split` | 10 | 3.20s | 3.23s | +1.0% | 3.23s | 3.42s | 0.99x | 489 MB |
| `synthetic-48-ssr-esm` | 10 | 1.86s | 1.83s | -1.3% | 1.87s | 2.22s | 1.01x | 338 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.84s | 14.87s | +0.2% | 8.88s | 8.91s | 2.03s | 2.02s | 2.02s | 2.01s | -0.7% | 14.88s | 15.10s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 5.07s | 5.10s | +0.5% | 3.41s | 3.44s | 0.54s | 0.54s | 0.48s | 0.48s | -0.3% | 5.11s | 5.22s | 0.99x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 5.13s | 5.07s | -1.3% | 3.46s | 3.41s | 0.54s | 0.54s | 0.48s | 0.48s | -0.5% | 5.12s | 5.25s | 1.01x | - |
| `synthetic-256-sourcemaps` | 10 | 2.51s | 2.47s | -1.6% | 1.91s | 1.89s | 0.23s | 0.23s | 0.15s | 0.15s | -0.1% | 2.48s | 2.55s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 2.26s | 2.28s | +0.9% | 1.71s | 1.72s | 0.23s | 0.23s | 0.13s | 0.13s | -0.1% | 2.28s | 2.35s | 0.99x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.26s | 2.28s | +0.8% | 1.69s | 1.72s | 0.23s | 0.23s | 0.13s | 0.13s | +0.2% | 2.30s | 2.38s | 0.99x | - |
| `synthetic-48-ssr-esm` | 10 | 1.10s | 1.11s | +0.5% | 0.85s | 0.84s | 0.13s | 0.13s | 0.05s | 0.05s | -0.9% | 1.10s | 1.12s | 1.00x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.03s | 104.10s | +6.2% | 104.10s | - | 0.94x | - |
| complex app | 2 | 102.13s | 104.46s | +2.3% | 104.46s | - | 0.98x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 89.51s | 90.55s | +1.2% | 79.61s | 80.40s | 3.09s | 3.27s | 4.33s | 4.33s | -0.0% | 90.55s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28487820688)

