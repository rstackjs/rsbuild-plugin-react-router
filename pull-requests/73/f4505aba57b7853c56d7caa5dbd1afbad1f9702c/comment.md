<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `f4505ab` against base `0f9b463`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.35s | 31.33s | -0.1% | 21.79s | 21.66s | -0.6% | 4.15s | 4.18s | +0.7% | 2.96s | 3.09s | +4.1% | 1.00x |
| Large app | 1 | 14.89s | 14.76s | -0.9% | 9.77s | 9.66s | -1.2% | 2.03s | 2.01s | -1.1% | 1.61s | 1.64s | +2.0% | 1.01x |
| Standard fixtures | 6 | 16.46s | 16.58s | +0.7% | 12.01s | 12.00s | -0.1% | 2.12s | 2.17s | +2.5% | 1.35s | 1.44s | +6.7% | 0.99x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.77s | 8.79s | +0.2% | 8.87s | 9.32s | 1.00x | 1497 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.32s | 4.36s | +0.8% | 4.34s | 4.52s | 0.99x | 631 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.80s | 5.80s | +0.0% | 5.77s | 5.88s | 1.00x | 788 MB |
| `synthetic-256-sourcemaps` | 10 | 2.35s | 2.33s | -1.1% | 2.34s | 2.52s | 1.01x | 439 MB |
| `synthetic-256-ssr-esm` | 10 | 2.17s | 2.16s | -0.6% | 2.16s | 2.35s | 1.01x | 405 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.57s | 2.58s | +0.4% | 2.58s | 2.74s | 1.00x | 434 MB |
| `synthetic-48-ssr-esm` | 10 | 1.55s | 1.52s | -1.9% | 1.54s | 1.75s | 1.02x | 309 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.89s | 14.76s | -0.9% | 9.77s | 9.66s | 2.03s | 2.01s | 1.61s | 1.64s | +2.0% | 14.86s | 15.15s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.65s | 4.71s | +1.2% | 3.42s | 3.42s | 0.53s | 0.54s | 0.46s | 0.48s | +5.2% | 4.76s | 4.99s | 0.99x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.64s | 4.78s | +2.9% | 3.39s | 3.45s | 0.53s | 0.53s | 0.45s | 0.48s | +5.6% | 4.82s | 5.10s | 0.97x | - |
| `synthetic-256-sourcemaps` | 10 | 2.21s | 2.19s | -1.1% | 1.66s | 1.68s | 0.28s | 0.27s | 0.13s | 0.13s | +1.9% | 2.19s | 2.27s | 1.01x | - |
| `synthetic-256-ssr-esm` | 10 | 1.96s | 1.95s | -0.2% | 1.40s | 1.39s | 0.32s | 0.33s | 0.13s | 0.13s | -0.2% | 1.95s | 2.01s | 1.00x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.97s | 1.94s | -1.7% | 1.40s | 1.36s | 0.31s | 0.34s | 0.13s | 0.15s | +17.4% | 1.93s | 2.02s | 1.02x | - |
| `synthetic-48-ssr-esm` | 10 | 1.03s | 1.01s | -1.2% | 0.74s | 0.70s | 0.15s | 0.16s | 0.06s | 0.08s | +27.6% | 1.00s | 1.06s | 1.01x | - |

### Synthetic Rsbuild App

Rendered 1 production build benchmark.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 1 | 98.23s | 98.01s | -0.2% | 98.01s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 1 | 83.68s | 83.80s | +0.1% | 75.35s | 75.38s | 2.98s | 2.98s | 3.18s | 3.24s | +1.8% | 83.80s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28479905466)

