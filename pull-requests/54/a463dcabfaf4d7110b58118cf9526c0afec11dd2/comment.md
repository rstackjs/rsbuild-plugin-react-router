<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a463dca` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.53s | 30.13s | -1.3% | 21.23s | 18.89s | -11.0% | 4.07s | 3.90s | -4.0% | 2.91s | 3.50s | +20.2% | 1.01x |
| Large app | 1 | 14.43s | 14.26s | -1.1% | 9.51s | 8.30s | -12.7% | 1.96s | 2.01s | +2.5% | 1.52s | 2.03s | +33.9% | 1.01x |
| Standard fixtures | 6 | 16.10s | 15.87s | -1.5% | 11.72s | 10.59s | -9.7% | 2.10s | 1.89s | -10.1% | 1.39s | 1.47s | +5.2% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.67s | 8.99s | +3.6% | 9.06s | 9.38s | 0.96x | 1505 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.15s | 4.31s | +4.0% | 4.32s | 4.45s | 0.96x | 589 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.54s | 5.79s | +4.6% | 5.79s | 6.11s | 0.96x | 760 MB |
| `synthetic-256-sourcemaps` | 10 | 2.27s | 2.41s | +6.0% | 2.42s | 2.56s | 0.94x | 442 MB |
| `synthetic-256-ssr-esm` | 10 | 2.14s | 2.28s | +6.1% | 2.29s | 2.44s | 0.94x | 398 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.54s | 2.71s | +6.8% | 2.73s | 2.89s | 0.94x | 418 MB |
| `synthetic-48-ssr-esm` | 10 | 1.52s | 1.61s | +5.9% | 1.64s | 1.97s | 0.94x | 316 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.43s | 14.26s | -1.1% | 9.51s | 8.30s | 1.96s | 2.01s | 1.52s | 2.03s | +33.9% | 14.24s | 14.36s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 4.66s | +3.1% | 3.33s | 3.02s | 0.52s | 0.53s | 0.45s | 0.48s | +5.4% | 4.70s | 4.83s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 4.72s | +3.9% | 3.31s | 3.07s | 0.53s | 0.53s | 0.46s | 0.48s | +5.2% | 4.70s | 4.75s | 0.96x | - |
| `synthetic-256-sourcemaps` | 10 | 2.15s | 1.98s | -7.8% | 1.62s | 1.40s | 0.28s | 0.24s | 0.13s | 0.15s | +19.0% | 1.98s | 2.02s | 1.08x | - |
| `synthetic-256-ssr-esm` | 10 | 1.94s | 1.80s | -7.5% | 1.38s | 1.21s | 0.31s | 0.23s | 0.13s | 0.15s | +19.7% | 1.79s | 1.88s | 1.08x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.94s | 1.79s | -7.8% | 1.37s | 1.22s | 0.31s | 0.23s | 0.15s | 0.15s | +0.5% | 1.79s | 1.85s | 1.08x | - |
| `synthetic-48-ssr-esm` | 10 | 1.01s | 0.92s | -8.8% | 0.72s | 0.66s | 0.15s | 0.13s | 0.08s | 0.05s | -32.9% | 0.92s | 0.98s | 1.10x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.43s | 113.88s | +3.1% | 113.88s | - | 0.97x | - |
| complex app | 2 | 76.47s | 78.45s | +2.6% | 78.45s | - | 0.97x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.76s | 98.27s | +1.6% | 88.40s | 88.59s | 2.83s | 2.90s | 3.17s | 4.37s | +37.8% | 98.27s | - | 0.98x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28552344916)

