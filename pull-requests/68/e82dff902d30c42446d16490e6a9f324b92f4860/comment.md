<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e82dff9` against base `2615ba3`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 32.68s | 31.38s | -4.0% | 21.32s | 20.56s | -3.5% | 3.93s | 3.80s | -3.3% | 3.53s | 3.31s | -6.0% | 1.04x |
| Large app | 1 | 14.80s | 14.18s | -4.2% | 8.86s | 8.47s | -4.3% | 2.01s | 1.95s | -2.9% | 2.11s | 1.93s | -8.7% | 1.04x |
| Standard fixtures | 6 | 17.88s | 17.21s | -3.8% | 12.46s | 12.09s | -3.0% | 1.92s | 1.85s | -3.8% | 1.42s | 1.39s | -2.1% | 1.04x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.69s | 9.58s | -1.1% | 9.58s | 9.63s | 1.01x | 1542 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.61s | 4.76s | +3.2% | 4.84s | 5.14s | 0.97x | 625 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 6.03s | 5.99s | -0.7% | 5.97s | 6.31s | 1.01x | 792 MB |
| `synthetic-256-sourcemaps` | 10 | 2.83s | 2.80s | -1.1% | 2.81s | 2.96s | 1.01x | 492 MB |
| `synthetic-256-ssr-esm` | 10 | 2.67s | 2.74s | +2.8% | 2.77s | 2.93s | 0.97x | 445 MB |
| `synthetic-256-ssr-esm-split` | 10 | 3.03s | 3.09s | +2.0% | 3.10s | 3.31s | 0.98x | 485 MB |
| `synthetic-48-ssr-esm` | 10 | 1.76s | 1.79s | +1.5% | 1.82s | 2.20s | 0.98x | 338 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.80s | 14.18s | -4.2% | 8.86s | 8.47s | 2.01s | 1.95s | 2.11s | 1.93s | -8.7% | 14.21s | 14.62s | 1.04x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.96s | 4.83s | -2.6% | 3.29s | 3.21s | 0.54s | 0.53s | 0.48s | 0.48s | +0.2% | 4.83s | 4.89s | 1.03x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 5.06s | 4.75s | -6.2% | 3.28s | 3.16s | 0.55s | 0.51s | 0.48s | 0.45s | -5.6% | 4.77s | 4.83s | 1.07x | - |
| `synthetic-256-sourcemaps` | 10 | 2.44s | 2.30s | -5.6% | 1.85s | 1.74s | 0.24s | 0.22s | 0.15s | 0.15s | -0.9% | 2.32s | 2.41s | 1.06x | - |
| `synthetic-256-ssr-esm` | 10 | 2.20s | 2.15s | -2.3% | 1.63s | 1.60s | 0.24s | 0.23s | 0.13s | 0.13s | -0.8% | 2.14s | 2.20s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.16s | 2.11s | -2.7% | 1.61s | 1.57s | 0.23s | 0.22s | 0.13s | 0.13s | -0.7% | 2.12s | 2.19s | 1.03x | - |
| `synthetic-48-ssr-esm` | 10 | 1.06s | 1.07s | +1.6% | 0.80s | 0.81s | 0.13s | 0.13s | 0.05s | 0.05s | +0.6% | 1.08s | 1.15s | 0.98x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 100.16s | 101.93s | +1.8% | 101.93s | - | 0.98x | - |
| complex app | 2 | 100.64s | 107.87s | +7.2% | 107.87s | - | 0.93x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 84.55s | 87.48s | +3.5% | 75.36s | 78.02s | 2.73s | 2.82s | 4.10s | 4.35s | +6.3% | 87.48s | - | 0.97x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28488347184)

