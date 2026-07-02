<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `28b3a8c` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 20.43s | 24.08s | +17.9% | 13.68s | 16.42s | +20.0% | 2.49s | 3.13s | +26.0% | 2.42s | 2.73s | +12.5% | 0.85x |
| Large app | 1 | 10.01s | 11.75s | +17.4% | 6.32s | 7.48s | +18.4% | 1.13s | 1.50s | +33.0% | 1.46s | 1.59s | +9.1% | 0.85x |
| Standard fixtures | 6 | 10.42s | 12.33s | +18.3% | 7.36s | 8.94s | +21.5% | 1.36s | 1.63s | +20.1% | 0.97s | 1.14s | +17.7% | 0.85x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 6.25s | 7.79s | +24.6% | 7.81s | 8.00s | 0.80x | 1535 MB |
| `synthetic-1024-ssr-esm` | 5 | 2.33s | 3.12s | +33.6% | 3.13s | 3.32s | 0.75x | 630 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 3.16s | 4.11s | +30.2% | 4.14s | 4.38s | 0.77x | 822 MB |
| `synthetic-256-sourcemaps` | 10 | 1.36s | 1.67s | +22.4% | 1.68s | 1.82s | 0.82x | 455 MB |
| `synthetic-256-ssr-esm` | 10 | 1.28s | 1.56s | +22.2% | 1.57s | 1.70s | 0.82x | 412 MB |
| `synthetic-256-ssr-esm-split` | 10 | 1.46s | 1.86s | +26.8% | 1.88s | 2.05s | 0.79x | 449 MB |
| `synthetic-48-ssr-esm` | 10 | 0.96s | 1.07s | +11.2% | 1.08s | 1.28s | 0.90x | 315 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 10.01s | 11.75s | +17.4% | 6.32s | 7.48s | 1.13s | 1.50s | 1.46s | 1.59s | +9.1% | 11.81s | 12.17s | 0.85x | - |
| `synthetic-1024-ssr-esm` | 5 | 2.94s | 3.64s | +23.7% | 2.12s | 2.63s | 0.32s | 0.46s | 0.30s | 0.38s | +25.4% | 3.68s | 3.92s | 0.81x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 2.93s | 3.54s | +20.8% | 2.04s | 2.55s | 0.33s | 0.46s | 0.28s | 0.38s | +35.5% | 3.56s | 3.66s | 0.83x | - |
| `synthetic-256-sourcemaps` | 10 | 1.42s | 1.62s | +14.1% | 1.06s | 1.21s | 0.17s | 0.20s | 0.13s | 0.13s | +0.6% | 1.62s | 1.64s | 0.88x | - |
| `synthetic-256-ssr-esm` | 10 | 1.24s | 1.39s | +12.1% | 0.83s | 1.00s | 0.22s | 0.20s | 0.11s | 0.10s | -4.7% | 1.39s | 1.45s | 0.89x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.22s | 1.43s | +16.7% | 0.84s | 1.03s | 0.22s | 0.20s | 0.10s | 0.10s | -0.4% | 1.43s | 1.49s | 0.86x | - |
| `synthetic-48-ssr-esm` | 10 | 0.67s | 0.71s | +6.5% | 0.46s | 0.51s | 0.09s | 0.10s | 0.05s | 0.05s | -0.7% | 0.71s | 0.74s | 0.94x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 74.03s | 90.06s | +21.6% | 90.06s | - | 0.82x | - |
| complex app | 2 | 49.82s | 64.99s | +30.4% | 64.99s | - | 0.77x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 67.45s | 76.62s | +13.6% | 61.08s | 69.04s | 1.56s | 2.08s | 3.49s | 3.73s | +7.0% | 76.62s | - | 0.88x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28573390612)

