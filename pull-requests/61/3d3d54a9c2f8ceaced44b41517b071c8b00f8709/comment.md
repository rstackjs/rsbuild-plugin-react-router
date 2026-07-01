<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `3d3d54a` against base `00d0e65`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.83s | 30.10s | -2.4% | 20.30s | 19.64s | -3.2% | 3.69s | 3.65s | -1.1% | 3.30s | 3.24s | -1.7% | 1.02x |
| Large app | 1 | 13.84s | 13.70s | -1.0% | 8.38s | 8.31s | -0.8% | 1.89s | 1.84s | -2.6% | 1.88s | 1.88s | -0.4% | 1.01x |
| Standard fixtures | 6 | 16.99s | 16.39s | -3.5% | 11.92s | 11.33s | -5.0% | 1.81s | 1.81s | +0.4% | 1.41s | 1.36s | -3.4% | 1.04x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.05s | 9.05s | +0.0% | 9.08s | 9.21s | 1.00x | 1542 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.48s | 4.53s | +1.3% | 4.56s | 4.78s | 0.99x | 629 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.84s | 5.65s | -3.2% | 5.73s | 6.12s | 1.03x | 787 MB |
| `synthetic-256-sourcemaps` | 10 | 2.71s | 2.70s | -0.5% | 2.72s | 2.87s | 1.00x | 499 MB |
| `synthetic-256-ssr-esm` | 10 | 2.62s | 2.60s | -1.1% | 2.61s | 2.75s | 1.01x | 432 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.97s | 2.98s | +0.4% | 2.99s | 3.10s | 1.00x | 488 MB |
| `synthetic-48-ssr-esm` | 10 | 1.71s | 1.69s | -1.2% | 1.73s | 2.08s | 1.01x | 345 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.84s | 13.70s | -1.0% | 8.38s | 8.31s | 1.89s | 1.84s | 1.88s | 1.88s | -0.4% | 13.75s | 13.95s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.71s | 4.54s | -3.7% | 3.11s | 2.94s | 0.51s | 0.51s | 0.48s | 0.46s | -4.8% | 4.56s | 4.63s | 1.04x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.75s | 4.54s | -4.5% | 3.14s | 2.95s | 0.51s | 0.52s | 0.48s | 0.45s | -5.3% | 4.56s | 4.67s | 1.05x | - |
| `synthetic-256-sourcemaps` | 10 | 2.30s | 2.23s | -2.8% | 1.75s | 1.68s | 0.22s | 0.22s | 0.15s | 0.15s | -0.6% | 2.24s | 2.29s | 1.03x | - |
| `synthetic-256-ssr-esm` | 10 | 2.09s | 2.04s | -2.6% | 1.56s | 1.49s | 0.22s | 0.22s | 0.13s | 0.13s | +0.1% | 2.03s | 2.12s | 1.03x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.10s | 2.03s | -3.1% | 1.58s | 1.50s | 0.22s | 0.22s | 0.13s | 0.13s | +0.6% | 2.04s | 2.12s | 1.03x | - |
| `synthetic-48-ssr-esm` | 10 | 1.03s | 1.01s | -2.2% | 0.79s | 0.76s | 0.12s | 0.12s | 0.05s | 0.05s | -0.6% | 1.01s | 1.04s | 1.02x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 97.50s | 97.62s | +0.1% | 97.62s | - | 1.00x | - |
| complex app | 2 | 97.10s | 96.53s | -0.6% | 96.53s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 83.49s | 82.74s | -0.9% | 74.34s | 73.62s | 2.70s | 2.71s | 4.23s | 4.18s | -1.2% | 82.74s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28487880797)

