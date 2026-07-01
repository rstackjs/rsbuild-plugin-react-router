<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c2450da` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.85s | 33.26s | +4.5% | 22.07s | 21.75s | -1.5% | 4.23s | 3.99s | -5.8% | 3.12s | 3.50s | +12.3% | 0.96x |
| Large app | 1 | 15.04s | 15.02s | -0.2% | 9.81s | 8.88s | -9.4% | 2.05s | 2.03s | -0.9% | 1.72s | 2.08s | +21.4% | 1.00x |
| Standard fixtures | 6 | 16.81s | 18.25s | +8.6% | 12.26s | 12.86s | +4.9% | 2.18s | 1.95s | -10.3% | 1.40s | 1.41s | +1.2% | 0.92x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.08s | 9.63s | +6.1% | 9.68s | 9.90s | 0.94x | 1547 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.30s | 4.86s | +13.2% | 4.94s | 5.13s | 0.88x | 629 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.65s | 6.19s | +9.6% | 6.21s | 6.45s | 0.91x | 787 MB |
| `synthetic-256-sourcemaps` | 10 | 2.32s | 2.86s | +23.5% | 2.89s | 3.06s | 0.81x | 499 MB |
| `synthetic-256-ssr-esm` | 10 | 2.19s | 2.81s | +28.4% | 2.83s | 3.10s | 0.78x | 451 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.57s | 3.23s | +25.5% | 3.23s | 3.38s | 0.80x | 485 MB |
| `synthetic-48-ssr-esm` | 10 | 1.55s | 1.84s | +18.9% | 1.87s | 2.25s | 0.84x | 335 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 15.04s | 15.02s | -0.2% | 9.81s | 8.88s | 2.05s | 2.03s | 1.72s | 2.08s | +21.4% | 14.98s | 15.23s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.77s | 5.09s | +6.7% | 3.51s | 3.39s | 0.55s | 0.55s | 0.46s | 0.48s | +4.6% | 5.09s | 5.12s | 0.94x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.72s | 5.05s | +7.0% | 3.48s | 3.35s | 0.55s | 0.55s | 0.48s | 0.48s | +0.3% | 5.11s | 5.27s | 0.93x | - |
| `synthetic-256-sourcemaps` | 10 | 2.26s | 2.47s | +9.1% | 1.68s | 1.88s | 0.30s | 0.24s | 0.13s | 0.15s | +18.8% | 2.46s | 2.52s | 0.92x | - |
| `synthetic-256-ssr-esm` | 10 | 2.01s | 2.27s | +13.3% | 1.43s | 1.70s | 0.32s | 0.24s | 0.13s | 0.13s | -2.9% | 2.29s | 2.34s | 0.88x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.00s | 2.26s | +13.1% | 1.41s | 1.69s | 0.32s | 0.24s | 0.13s | 0.13s | -1.4% | 2.25s | 2.29s | 0.88x | - |
| `synthetic-48-ssr-esm` | 10 | 1.05s | 1.10s | +5.2% | 0.76s | 0.84s | 0.15s | 0.13s | 0.08s | 0.05s | -32.4% | 1.10s | 1.14s | 0.95x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 103.39s | 106.17s | +2.7% | 106.17s | - | 0.97x | - |
| complex app | 2 | 102.30s | 107.08s | +4.7% | 107.08s | - | 0.96x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 87.05s | 86.62s | -0.5% | 77.92s | 76.70s | 3.12s | 3.20s | 3.43s | 4.26s | +24.3% | 86.62s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28486833886)

