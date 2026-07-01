<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `35b574c` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.53s | 31.57s | +3.4% | 21.23s | 20.64s | -2.8% | 4.07s | 3.85s | -5.4% | 2.91s | 3.35s | +15.1% | 0.97x |
| Large app | 1 | 14.43s | 14.30s | -0.8% | 9.51s | 8.57s | -9.9% | 1.96s | 1.99s | +1.1% | 1.52s | 1.94s | +27.6% | 1.01x |
| Standard fixtures | 6 | 16.10s | 17.26s | +7.2% | 11.72s | 12.07s | +3.0% | 2.10s | 1.86s | -11.5% | 1.39s | 1.41s | +1.3% | 0.93x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.67s | 9.32s | +7.5% | 9.35s | 9.63s | 0.93x | 1534 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.15s | 4.76s | +14.8% | 4.83s | 5.07s | 0.87x | 628 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.54s | 6.18s | +11.6% | 6.21s | 6.47s | 0.90x | 803 MB |
| `synthetic-256-sourcemaps` | 10 | 2.27s | 2.82s | +24.2% | 2.84s | 3.00s | 0.81x | 485 MB |
| `synthetic-256-ssr-esm` | 10 | 2.14s | 2.73s | +27.3% | 2.74s | 2.90s | 0.79x | 451 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.54s | 3.11s | +22.8% | 3.13s | 3.31s | 0.81x | 483 MB |
| `synthetic-48-ssr-esm` | 10 | 1.52s | 1.76s | +15.9% | 1.79s | 2.12s | 0.86x | 341 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.43s | 14.30s | -0.8% | 9.51s | 8.57s | 1.96s | 1.99s | 1.52s | 1.94s | +27.6% | 14.33s | 14.55s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 4.74s | +5.0% | 3.33s | 3.11s | 0.52s | 0.52s | 0.45s | 0.48s | +5.5% | 4.77s | 4.82s | 0.95x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 4.82s | +6.1% | 3.31s | 3.18s | 0.53s | 0.53s | 0.46s | 0.48s | +4.8% | 4.81s | 4.90s | 0.94x | - |
| `synthetic-256-sourcemaps` | 10 | 2.15s | 2.35s | +9.6% | 1.62s | 1.78s | 0.28s | 0.23s | 0.13s | 0.15s | +18.8% | 2.36s | 2.42s | 0.91x | - |
| `synthetic-256-ssr-esm` | 10 | 1.94s | 2.14s | +10.1% | 1.38s | 1.59s | 0.31s | 0.23s | 0.13s | 0.13s | -0.5% | 2.14s | 2.20s | 0.91x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.94s | 2.14s | +10.2% | 1.37s | 1.60s | 0.31s | 0.23s | 0.15s | 0.13s | -17.3% | 2.14s | 2.21s | 0.91x | - |
| `synthetic-48-ssr-esm` | 10 | 1.01s | 1.07s | +6.0% | 0.72s | 0.82s | 0.15s | 0.13s | 0.08s | 0.05s | -32.7% | 1.07s | 1.09s | 0.94x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.43s | 110.56s | +0.1% | 110.56s | - | 1.00x | - |
| complex app | 2 | 76.47s | 78.13s | +2.2% | 78.13s | - | 0.98x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.76s | 97.12s | +0.4% | 88.40s | 87.54s | 2.83s | 2.88s | 3.17s | 4.18s | +31.8% | 97.12s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28504277229)

