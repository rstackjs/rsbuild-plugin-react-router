<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `066aaa5` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.53s | 30.71s | +0.6% | 21.23s | 19.95s | -6.0% | 4.07s | 3.74s | -8.1% | 2.91s | 3.32s | +14.2% | 0.99x |
| Large app | 1 | 14.43s | 13.91s | -3.6% | 9.51s | 8.31s | -12.7% | 1.96s | 1.88s | -4.4% | 1.52s | 1.91s | +25.8% | 1.04x |
| Standard fixtures | 6 | 16.10s | 16.80s | +4.3% | 11.72s | 11.65s | -0.6% | 2.10s | 1.86s | -11.4% | 1.39s | 1.41s | +1.4% | 0.96x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.67s | 9.36s | +8.0% | 9.42s | 9.77s | 0.93x | 1554 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.15s | 4.54s | +9.6% | 4.58s | 4.81s | 0.91x | 630 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.54s | 5.82s | +5.2% | 5.90s | 6.27s | 0.95x | 801 MB |
| `synthetic-256-sourcemaps` | 10 | 2.27s | 2.76s | +21.5% | 2.78s | 2.98s | 0.82x | 490 MB |
| `synthetic-256-ssr-esm` | 10 | 2.14s | 2.62s | +22.1% | 2.63s | 2.80s | 0.82x | 441 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.54s | 3.03s | +19.6% | 3.04s | 3.22s | 0.84x | 491 MB |
| `synthetic-48-ssr-esm` | 10 | 1.52s | 1.72s | +13.4% | 1.76s | 2.14s | 0.88x | 335 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.43s | 13.91s | -3.6% | 9.51s | 8.31s | 1.96s | 1.88s | 1.52s | 1.91s | +25.8% | 14.22s | 15.38s | 1.04x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 4.66s | +3.2% | 3.33s | 3.02s | 0.52s | 0.53s | 0.45s | 0.48s | +5.5% | 4.69s | 4.82s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 4.70s | +3.3% | 3.31s | 3.07s | 0.53s | 0.52s | 0.46s | 0.48s | +4.6% | 4.69s | 4.81s | 0.97x | - |
| `synthetic-256-sourcemaps` | 10 | 2.15s | 2.25s | +4.7% | 1.62s | 1.70s | 0.28s | 0.22s | 0.13s | 0.15s | +19.3% | 2.25s | 2.32s | 0.96x | - |
| `synthetic-256-ssr-esm` | 10 | 1.94s | 2.07s | +6.7% | 1.38s | 1.53s | 0.31s | 0.23s | 0.13s | 0.13s | -0.5% | 2.10s | 2.23s | 0.94x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.94s | 2.08s | +7.1% | 1.37s | 1.54s | 0.31s | 0.23s | 0.15s | 0.13s | -16.6% | 2.08s | 2.12s | 0.93x | - |
| `synthetic-48-ssr-esm` | 10 | 1.01s | 1.05s | +3.9% | 0.72s | 0.80s | 0.15s | 0.13s | 0.08s | 0.05s | -32.9% | 1.05s | 1.10s | 0.96x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.43s | 113.26s | +2.6% | 113.26s | - | 0.98x | - |
| complex app | 2 | 76.47s | 79.68s | +4.2% | 79.68s | - | 0.96x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.76s | 96.25s | -0.5% | 88.40s | 87.13s | 2.83s | 2.64s | 3.17s | 4.21s | +32.8% | 96.25s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28539265226)

