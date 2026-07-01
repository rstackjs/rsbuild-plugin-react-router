<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `879a584` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 32.54s | 33.77s | +3.8% | 22.46s | 22.00s | -2.1% | 4.28s | 4.09s | -4.3% | 3.24s | 3.60s | +11.2% | 0.96x |
| Large app | 1 | 15.35s | 15.39s | +0.3% | 9.97s | 9.15s | -8.2% | 2.08s | 2.10s | +1.0% | 1.79s | 2.14s | +19.4% | 1.00x |
| Standard fixtures | 6 | 17.19s | 18.38s | +6.9% | 12.49s | 12.84s | +2.8% | 2.20s | 1.99s | -9.3% | 1.45s | 1.47s | +1.1% | 0.94x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.03s | 9.74s | +7.9% | 9.79s | 9.97s | 0.93x | 1542 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.36s | 4.91s | +12.6% | 4.97s | 5.29s | 0.89x | 637 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.97s | 6.38s | +7.0% | 6.42s | 6.69s | 0.93x | 795 MB |
| `synthetic-256-sourcemaps` | 10 | 2.39s | 2.94s | +22.8% | 2.95s | 3.12s | 0.81x | 489 MB |
| `synthetic-256-ssr-esm` | 10 | 2.27s | 2.82s | +24.5% | 2.83s | 3.00s | 0.80x | 447 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.65s | 3.26s | +22.8% | 3.26s | 3.45s | 0.81x | 491 MB |
| `synthetic-48-ssr-esm` | 10 | 1.60s | 1.82s | +13.2% | 1.85s | 2.21s | 0.88x | 338 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 15.35s | 15.39s | +0.3% | 9.97s | 9.15s | 2.08s | 2.10s | 1.79s | 2.14s | +19.4% | 15.33s | 15.71s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.77s | 5.11s | +7.2% | 3.54s | 3.36s | 0.55s | 0.56s | 0.46s | 0.50s | +10.3% | 5.12s | 5.20s | 0.93x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.98s | 5.09s | +2.3% | 3.57s | 3.37s | 0.56s | 0.57s | 0.48s | 0.50s | +5.4% | 5.09s | 5.15s | 0.98x | - |
| `synthetic-256-sourcemaps` | 10 | 2.34s | 2.50s | +6.9% | 1.75s | 1.90s | 0.30s | 0.24s | 0.15s | 0.15s | -0.4% | 2.51s | 2.58s | 0.94x | - |
| `synthetic-256-ssr-esm` | 10 | 2.01s | 2.28s | +13.6% | 1.42s | 1.67s | 0.31s | 0.24s | 0.15s | 0.13s | -17.4% | 2.27s | 2.35s | 0.88x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.05s | 2.26s | +10.4% | 1.45s | 1.68s | 0.33s | 0.24s | 0.13s | 0.13s | -3.0% | 2.26s | 2.32s | 0.91x | - |
| `synthetic-48-ssr-esm` | 10 | 1.05s | 1.13s | +7.8% | 0.76s | 0.86s | 0.15s | 0.13s | 0.08s | 0.05s | -33.0% | 1.12s | 1.17s | 0.93x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 104.16s | 102.58s | -1.5% | 102.58s | - | 1.02x | - |
| complex app | 2 | 102.71s | 103.60s | +0.9% | 103.60s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 85.67s | 88.30s | +3.1% | 76.86s | 78.24s | 3.03s | 3.17s | 3.29s | 4.39s | +33.1% | 88.30s | - | 0.97x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28494965868)

