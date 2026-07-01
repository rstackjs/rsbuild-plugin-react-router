<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `15e545f` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.53s | 30.87s | +1.1% | 21.23s | 19.23s | -9.4% | 4.07s | 4.04s | -0.6% | 2.91s | 3.67s | +26.1% | 0.99x |
| Large app | 1 | 14.43s | 14.88s | +3.2% | 9.51s | 8.71s | -8.4% | 1.96s | 2.12s | +7.8% | 1.52s | 2.21s | +45.3% | 0.97x |
| Standard fixtures | 6 | 16.10s | 15.99s | -0.7% | 11.72s | 10.52s | -10.3% | 2.10s | 1.93s | -8.4% | 1.39s | 1.47s | +5.3% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.67s | 9.15s | +5.6% | 9.23s | 9.64s | 0.95x | 1508 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.15s | 4.48s | +8.0% | 4.55s | 4.85s | 0.93x | 591 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.54s | 6.00s | +8.4% | 6.03s | 6.18s | 0.92x | 755 MB |
| `synthetic-256-sourcemaps` | 10 | 2.27s | 2.47s | +8.5% | 2.49s | 2.73s | 0.92x | 426 MB |
| `synthetic-256-ssr-esm` | 10 | 2.14s | 2.33s | +8.5% | 2.34s | 2.51s | 0.92x | 390 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.54s | 2.79s | +10.1% | 2.78s | 2.90s | 0.91x | 426 MB |
| `synthetic-48-ssr-esm` | 10 | 1.52s | 1.67s | +9.8% | 1.70s | 1.98s | 0.91x | 319 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.43s | 14.88s | +3.2% | 9.51s | 8.71s | 1.96s | 2.12s | 1.52s | 2.21s | +45.3% | 15.29s | 16.96s | 0.97x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 4.67s | +3.5% | 3.33s | 3.00s | 0.52s | 0.54s | 0.45s | 0.48s | +5.4% | 4.69s | 4.77s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 4.72s | +3.7% | 3.31s | 3.02s | 0.53s | 0.55s | 0.46s | 0.48s | +5.2% | 4.72s | 4.80s | 0.96x | - |
| `synthetic-256-sourcemaps` | 10 | 2.15s | 2.06s | -4.1% | 1.62s | 1.40s | 0.28s | 0.25s | 0.13s | 0.15s | +20.0% | 2.04s | 2.12s | 1.04x | - |
| `synthetic-256-ssr-esm` | 10 | 1.94s | 1.81s | -7.0% | 1.38s | 1.21s | 0.31s | 0.23s | 0.13s | 0.15s | +20.1% | 1.80s | 1.87s | 1.07x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.94s | 1.79s | -7.5% | 1.37s | 1.20s | 0.31s | 0.23s | 0.15s | 0.15s | -0.1% | 1.80s | 1.92s | 1.08x | - |
| `synthetic-48-ssr-esm` | 10 | 1.01s | 0.94s | -7.0% | 0.72s | 0.68s | 0.15s | 0.13s | 0.08s | 0.05s | -33.6% | 0.94s | 0.97s | 1.08x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.43s | 113.43s | +2.7% | 113.43s | - | 0.97x | - |
| complex app | 2 | 76.47s | 93.98s | +22.9% | 93.98s | - | 0.81x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.76s | 107.39s | +11.0% | 88.40s | 97.26s | 2.83s | 3.15s | 3.17s | 4.42s | +39.6% | 107.39s | - | 0.90x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28554540135)

