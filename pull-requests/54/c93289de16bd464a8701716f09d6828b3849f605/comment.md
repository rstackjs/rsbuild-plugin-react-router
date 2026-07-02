<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c93289d` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.37s | 30.11s | -4.0% | 21.61s | 19.89s | -8.0% | 4.23s | 4.25s | +0.3% | 3.14s | 3.39s | +7.9% | 1.04x |
| Large app | 1 | 14.98s | 14.36s | -4.2% | 9.80s | 8.67s | -11.5% | 1.99s | 2.11s | +6.0% | 1.70s | 1.93s | +13.7% | 1.04x |
| Standard fixtures | 6 | 16.39s | 15.75s | -3.9% | 11.81s | 11.22s | -5.0% | 2.25s | 2.14s | -4.7% | 1.45s | 1.47s | +1.2% | 1.04x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.90s | 9.09s | +2.2% | 9.11s | 9.36s | 0.98x | 1467 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.21s | 4.46s | +5.9% | 4.49s | 4.70s | 0.94x | 535 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.67s | 5.96s | +5.1% | 5.96s | 6.15s | 0.95x | 655 MB |
| `synthetic-256-sourcemaps` | 10 | 2.33s | 2.17s | -6.6% | 2.19s | 2.39s | 1.07x | 389 MB |
| `synthetic-256-ssr-esm` | 10 | 2.15s | 2.02s | -5.9% | 2.04s | 2.26s | 1.06x | 366 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.58s | 2.49s | -3.5% | 2.50s | 2.65s | 1.04x | 387 MB |
| `synthetic-48-ssr-esm` | 10 | 1.54s | 1.34s | -13.3% | 1.37s | 1.63s | 1.15x | 309 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.98s | 14.36s | -4.2% | 9.80s | 8.67s | 1.99s | 2.11s | 1.70s | 1.93s | +13.7% | 14.33s | 14.49s | 1.04x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 4.61s | +2.2% | 3.30s | 3.24s | 0.54s | 0.60s | 0.46s | 0.48s | +4.9% | 4.73s | 4.94s | 0.98x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.58s | 4.69s | +2.4% | 3.33s | 3.34s | 0.54s | 0.60s | 0.48s | 0.50s | +4.9% | 4.69s | 4.76s | 0.98x | - |
| `synthetic-256-sourcemaps` | 10 | 2.26s | 2.04s | -9.7% | 1.68s | 1.51s | 0.32s | 0.27s | 0.13s | 0.15s | +18.0% | 2.03s | 2.09s | 1.11x | - |
| `synthetic-256-ssr-esm` | 10 | 1.99s | 1.75s | -12.1% | 1.35s | 1.25s | 0.35s | 0.26s | 0.15s | 0.13s | -17.1% | 1.76s | 1.79s | 1.14x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.02s | 1.77s | -12.2% | 1.40s | 1.26s | 0.35s | 0.27s | 0.15s | 0.13s | -16.8% | 1.77s | 1.82s | 1.14x | - |
| `synthetic-48-ssr-esm` | 10 | 1.04s | 0.89s | -14.1% | 0.75s | 0.63s | 0.15s | 0.14s | 0.08s | 0.08s | -0.2% | 0.89s | 0.96s | 1.16x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 115.18s | 123.95s | +7.6% | 123.95s | - | 0.93x | - |
| complex app | 2 | 79.88s | 93.31s | +16.8% | 93.31s | - | 0.86x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.53s | 105.90s | +12.0% | 86.54s | 96.67s | 2.63s | 3.05s | 3.18s | 3.52s | +10.5% | 105.90s | - | 0.89x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28565314948)

