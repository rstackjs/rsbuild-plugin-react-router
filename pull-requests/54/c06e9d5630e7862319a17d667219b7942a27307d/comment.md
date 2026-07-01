<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c06e9d5` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.53s | 29.96s | -1.9% | 21.23s | 18.87s | -11.1% | 4.07s | 3.86s | -5.1% | 2.91s | 3.44s | +18.2% | 1.02x |
| Large app | 1 | 14.43s | 14.13s | -2.1% | 9.51s | 8.33s | -12.4% | 1.96s | 1.97s | +0.3% | 1.52s | 2.00s | +31.7% | 1.02x |
| Standard fixtures | 6 | 16.10s | 15.83s | -1.7% | 11.72s | 10.54s | -10.1% | 2.10s | 1.89s | -10.1% | 1.39s | 1.44s | +3.5% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.67s | 8.99s | +3.6% | 9.04s | 9.33s | 0.96x | 1523 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.15s | 4.35s | +5.0% | 4.35s | 4.47s | 0.95x | 583 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.54s | 5.73s | +3.5% | 5.75s | 5.87s | 0.97x | 744 MB |
| `synthetic-256-sourcemaps` | 10 | 2.27s | 2.39s | +5.3% | 2.41s | 2.56s | 0.95x | 430 MB |
| `synthetic-256-ssr-esm` | 10 | 2.14s | 2.28s | +6.2% | 2.29s | 2.46s | 0.94x | 399 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.54s | 2.72s | +7.4% | 2.74s | 2.88s | 0.93x | 427 MB |
| `synthetic-48-ssr-esm` | 10 | 1.52s | 1.62s | +6.3% | 1.66s | 2.04s | 0.94x | 319 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.43s | 14.13s | -2.1% | 9.51s | 8.33s | 1.96s | 1.97s | 1.52s | 2.00s | +31.7% | 14.11s | 14.24s | 1.02x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 4.66s | +3.3% | 3.33s | 3.02s | 0.52s | 0.53s | 0.45s | 0.48s | +5.6% | 4.69s | 4.77s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 4.69s | +3.0% | 3.31s | 3.03s | 0.53s | 0.53s | 0.46s | 0.48s | +4.9% | 4.68s | 4.73s | 0.97x | - |
| `synthetic-256-sourcemaps` | 10 | 2.15s | 2.00s | -7.1% | 1.62s | 1.42s | 0.28s | 0.24s | 0.13s | 0.15s | +19.9% | 2.02s | 2.10s | 1.08x | - |
| `synthetic-256-ssr-esm` | 10 | 1.94s | 1.78s | -8.3% | 1.38s | 1.21s | 0.31s | 0.23s | 0.13s | 0.13s | +0.7% | 1.79s | 1.88s | 1.09x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.94s | 1.78s | -8.5% | 1.37s | 1.20s | 0.31s | 0.23s | 0.15s | 0.15s | -0.5% | 1.78s | 1.84s | 1.09x | - |
| `synthetic-48-ssr-esm` | 10 | 1.01s | 0.93s | -7.8% | 0.72s | 0.67s | 0.15s | 0.13s | 0.08s | 0.05s | -32.1% | 0.92s | 0.95s | 1.08x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.43s | 111.28s | +0.8% | 111.28s | - | 0.99x | - |
| complex app | 2 | 76.47s | 77.29s | +1.1% | 77.29s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.76s | 96.50s | -0.3% | 88.40s | 87.00s | 2.83s | 2.84s | 3.17s | 4.21s | +32.9% | 96.50s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28551244772)

