<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `4ca1473` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.98s | 32.13s | +3.7% | 21.52s | 20.97s | -2.6% | 4.09s | 3.86s | -5.6% | 3.01s | 3.44s | +14.1% | 0.96x |
| Large app | 1 | 14.58s | 14.55s | -0.2% | 9.60s | 8.60s | -10.4% | 1.97s | 1.99s | +0.7% | 1.59s | 2.03s | +27.1% | 1.00x |
| Standard fixtures | 6 | 16.40s | 17.59s | +7.3% | 11.92s | 12.36s | +3.7% | 2.12s | 1.87s | -11.5% | 1.42s | 1.41s | -0.5% | 0.93x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.72s | 9.39s | +7.6% | 9.44s | 9.77s | 0.93x | 1551 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.25s | 4.91s | +15.4% | 4.96s | 5.13s | 0.87x | 629 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.62s | 6.02s | +7.0% | 6.05s | 6.18s | 0.93x | 793 MB |
| `synthetic-256-sourcemaps` | 10 | 2.29s | 2.83s | +23.3% | 2.85s | 3.02s | 0.81x | 480 MB |
| `synthetic-256-ssr-esm` | 10 | 2.14s | 2.74s | +28.0% | 2.75s | 2.92s | 0.78x | 466 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.57s | 3.14s | +22.1% | 3.14s | 3.27s | 0.82x | 490 MB |
| `synthetic-48-ssr-esm` | 10 | 1.53s | 1.77s | +16.2% | 1.81s | 2.14s | 0.86x | 335 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.58s | 14.55s | -0.2% | 9.60s | 8.60s | 1.97s | 1.99s | 1.59s | 2.03s | +27.1% | 14.59s | 14.84s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.55s | 4.89s | +7.5% | 3.32s | 3.24s | 0.53s | 0.53s | 0.46s | 0.48s | +5.1% | 4.91s | 5.01s | 0.93x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.67s | 4.92s | +5.4% | 3.44s | 3.26s | 0.53s | 0.53s | 0.48s | 0.48s | -0.2% | 4.91s | 5.06s | 0.95x | - |
| `synthetic-256-sourcemaps` | 10 | 2.22s | 2.38s | +7.2% | 1.66s | 1.80s | 0.28s | 0.23s | 0.13s | 0.15s | +18.3% | 2.38s | 2.43s | 0.93x | - |
| `synthetic-256-ssr-esm` | 10 | 1.96s | 2.16s | +10.4% | 1.36s | 1.62s | 0.32s | 0.23s | 0.15s | 0.13s | -16.8% | 2.17s | 2.27s | 0.91x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.96s | 2.15s | +9.8% | 1.40s | 1.61s | 0.31s | 0.23s | 0.15s | 0.13s | -17.0% | 2.16s | 2.23s | 0.91x | - |
| `synthetic-48-ssr-esm` | 10 | 1.04s | 1.08s | +3.7% | 0.75s | 0.82s | 0.15s | 0.13s | 0.05s | 0.05s | -1.4% | 1.08s | 1.10s | 0.96x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.11s | 110.85s | +0.7% | 110.85s | - | 0.99x | - |
| complex app | 2 | 77.36s | 77.18s | -0.2% | 77.18s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 95.94s | 98.91s | +3.1% | 87.40s | 88.59s | 2.85s | 3.14s | 3.19s | 4.63s | +45.2% | 98.91s | - | 0.97x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28498068926)

