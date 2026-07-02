<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `5b3357d` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.37s | 28.94s | -7.8% | 21.61s | 18.77s | -13.1% | 4.23s | 4.04s | -4.6% | 3.14s | 3.47s | +10.5% | 1.08x |
| Large app | 1 | 14.98s | 13.84s | -7.6% | 9.80s | 8.08s | -17.5% | 1.99s | 1.95s | -2.1% | 1.70s | 2.06s | +21.4% | 1.08x |
| Standard fixtures | 6 | 16.39s | 15.10s | -7.9% | 11.81s | 10.69s | -9.5% | 2.25s | 2.09s | -6.9% | 1.45s | 1.41s | -2.4% | 1.09x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.90s | 8.80s | -1.1% | 8.85s | 9.05s | 1.01x | 1442 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.21s | 4.51s | +7.1% | 4.53s | 4.76s | 0.93x | 547 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.67s | 5.88s | +3.7% | 5.83s | 5.91s | 0.96x | 670 MB |
| `synthetic-256-sourcemaps` | 10 | 2.33s | 2.42s | +4.0% | 2.44s | 2.62s | 0.96x | 411 MB |
| `synthetic-256-ssr-esm` | 10 | 2.15s | 2.25s | +4.7% | 2.26s | 2.43s | 0.96x | 391 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.58s | 2.61s | +1.1% | 2.62s | 2.76s | 0.99x | 390 MB |
| `synthetic-48-ssr-esm` | 10 | 1.54s | 1.59s | +3.2% | 1.62s | 1.85s | 0.97x | 317 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.98s | 13.84s | -7.6% | 9.80s | 8.08s | 1.99s | 1.95s | 1.70s | 2.06s | +21.4% | 13.86s | 14.05s | 1.08x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 4.46s | -1.2% | 3.30s | 3.12s | 0.54s | 0.62s | 0.46s | 0.48s | +4.8% | 4.60s | 4.97s | 1.01x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.58s | 4.34s | -5.1% | 3.33s | 3.06s | 0.54s | 0.58s | 0.48s | 0.48s | -0.5% | 4.33s | 4.41s | 1.05x | - |
| `synthetic-256-sourcemaps` | 10 | 2.26s | 1.89s | -16.3% | 1.68s | 1.41s | 0.32s | 0.24s | 0.13s | 0.15s | +17.1% | 1.91s | 2.00s | 1.19x | - |
| `synthetic-256-ssr-esm` | 10 | 1.99s | 1.78s | -10.7% | 1.35s | 1.22s | 0.35s | 0.26s | 0.15s | 0.13s | -16.9% | 1.76s | 1.96s | 1.12x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.02s | 1.72s | -14.8% | 1.40s | 1.22s | 0.35s | 0.26s | 0.15s | 0.13s | -17.4% | 1.72s | 1.78s | 1.17x | - |
| `synthetic-48-ssr-esm` | 10 | 1.04s | 0.91s | -12.2% | 0.75s | 0.65s | 0.15s | 0.13s | 0.08s | 0.05s | -31.1% | 0.91s | 0.94s | 1.14x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 115.18s | 111.00s | -3.6% | 111.00s | - | 1.04x | - |
| complex app | 2 | 79.88s | 79.04s | -1.1% | 79.04s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.53s | 94.51s | -0.0% | 86.54s | 85.39s | 2.63s | 2.61s | 3.18s | 4.25s | +33.4% | 94.51s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28559166554)

