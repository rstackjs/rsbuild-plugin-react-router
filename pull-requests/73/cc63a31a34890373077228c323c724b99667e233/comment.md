<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `cc63a31` against base `0f9b463`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.31s | 30.11s | -0.7% | 20.87s | 20.56s | -1.5% | 4.08s | 4.06s | -0.4% | 3.09s | 3.07s | -0.5% | 1.01x |
| Large app | 1 | 14.30s | 14.28s | -0.1% | 9.28s | 9.27s | -0.2% | 1.94s | 1.88s | -3.0% | 1.67s | 1.70s | +2.1% | 1.00x |
| Standard fixtures | 6 | 16.02s | 15.83s | -1.1% | 11.59s | 11.29s | -2.6% | 2.14s | 2.18s | +2.0% | 1.42s | 1.37s | -3.5% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.63s | 8.64s | +0.2% | 8.71s | 8.89s | 1.00x | 1505 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.04s | 4.09s | +1.1% | 4.15s | 4.48s | 0.99x | 630 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.42s | 5.36s | -1.2% | 5.37s | 5.63s | 1.01x | 773 MB |
| `synthetic-256-sourcemaps` | 10 | 2.22s | 2.24s | +0.8% | 2.25s | 2.46s | 0.99x | 445 MB |
| `synthetic-256-ssr-esm` | 10 | 2.09s | 2.09s | -0.1% | 2.11s | 2.27s | 1.00x | 390 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.46s | 2.47s | +0.5% | 2.48s | 2.58s | 0.99x | 441 MB |
| `synthetic-48-ssr-esm` | 10 | 1.51s | 1.50s | -0.3% | 1.53s | 1.73s | 1.00x | 302 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.30s | 14.28s | -0.1% | 9.28s | 9.27s | 1.94s | 1.88s | 1.67s | 1.70s | +2.1% | 14.67s | 15.41s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.47s | 4.61s | +3.2% | 3.25s | 3.24s | 0.55s | 0.53s | 0.45s | 0.48s | +6.0% | 4.62s | 4.82s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.53s | 4.44s | -1.9% | 3.32s | 3.20s | 0.52s | 0.57s | 0.45s | 0.45s | +0.1% | 4.43s | 4.52s | 1.02x | - |
| `synthetic-256-sourcemaps` | 10 | 2.16s | 2.07s | -4.1% | 1.63s | 1.56s | 0.30s | 0.26s | 0.13s | 0.13s | -1.7% | 2.08s | 2.12s | 1.04x | - |
| `synthetic-256-ssr-esm` | 10 | 1.92s | 1.86s | -3.0% | 1.33s | 1.29s | 0.31s | 0.34s | 0.15s | 0.13s | -17.3% | 1.86s | 1.90s | 1.03x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.92s | 1.85s | -4.0% | 1.33s | 1.30s | 0.31s | 0.33s | 0.16s | 0.13s | -16.8% | 1.86s | 2.02s | 1.04x | - |
| `synthetic-48-ssr-esm` | 10 | 1.02s | 0.99s | -2.3% | 0.74s | 0.70s | 0.15s | 0.15s | 0.08s | 0.05s | -28.7% | 0.99s | 1.03s | 1.02x | - |

### Synthetic Rsbuild App

Rendered 1 production build benchmark.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.46s | 98.40s | -0.1% | 98.40s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 82.24s | 83.47s | +1.5% | 74.31s | 75.49s | 2.64s | 2.72s | 3.07s | 3.08s | +0.2% | 83.47s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28483003332)

