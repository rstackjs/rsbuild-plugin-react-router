<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2615ba3` against base `c2450da`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.62s | 31.23s | -1.2% | 20.79s | 20.56s | -1.1% | 3.78s | 3.72s | -1.4% | 3.39s | 3.29s | -2.8% | 1.01x |
| Large app | 1 | 14.22s | 13.86s | -2.5% | 8.57s | 8.38s | -2.3% | 1.91s | 1.86s | -2.9% | 1.97s | 1.88s | -4.9% | 1.03x |
| Standard fixtures | 6 | 17.40s | 17.37s | -0.2% | 12.22s | 12.19s | -0.2% | 1.86s | 1.87s | +0.1% | 1.41s | 1.41s | +0.0% | 1.00x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.02s | 9.13s | +1.1% | 9.17s | 9.37s | 0.99x | 1547 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.52s | 4.52s | -0.0% | 4.53s | 4.70s | 1.00x | 624 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.81s | 5.74s | -1.1% | 5.79s | 6.01s | 1.01x | 784 MB |
| `synthetic-256-sourcemaps` | 10 | 2.74s | 2.71s | -1.1% | 2.72s | 2.88s | 1.01x | 482 MB |
| `synthetic-256-ssr-esm` | 10 | 2.65s | 2.60s | -1.7% | 2.61s | 2.77s | 1.02x | 444 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.98s | 2.97s | -0.6% | 2.98s | 3.20s | 1.01x | 486 MB |
| `synthetic-48-ssr-esm` | 10 | 1.76s | 1.70s | -3.4% | 1.74s | 2.10s | 1.04x | 336 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.22s | 13.86s | -2.5% | 8.57s | 8.38s | 1.91s | 1.86s | 1.97s | 1.88s | -4.9% | 13.84s | 14.04s | 1.03x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.86s | 4.88s | +0.4% | 3.25s | 3.24s | 0.52s | 0.53s | 0.48s | 0.48s | +0.1% | 4.84s | 4.93s | 1.00x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.84s | 4.87s | +0.5% | 3.19s | 3.22s | 0.53s | 0.53s | 0.48s | 0.48s | +0.1% | 4.82s | 4.96s | 1.00x | - |
| `synthetic-256-sourcemaps` | 10 | 2.34s | 2.34s | -0.3% | 1.78s | 1.76s | 0.23s | 0.23s | 0.15s | 0.15s | +0.0% | 2.34s | 2.41s | 1.00x | - |
| `synthetic-256-ssr-esm` | 10 | 2.15s | 2.12s | -1.7% | 1.60s | 1.58s | 0.23s | 0.23s | 0.13s | 0.13s | -0.5% | 2.12s | 2.14s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.15s | 2.13s | -0.8% | 1.59s | 1.59s | 0.23s | 0.23s | 0.13s | 0.13s | +0.4% | 2.12s | 2.16s | 1.01x | - |
| `synthetic-48-ssr-esm` | 10 | 1.05s | 1.04s | -0.8% | 0.79s | 0.78s | 0.12s | 0.13s | 0.05s | 0.05s | -0.2% | 1.04s | 1.09s | 1.01x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.57s | 103.31s | +4.8% | 103.31s | - | 0.95x | - |
| complex app | 2 | 112.88s | 102.24s | -9.4% | 102.24s | - | 1.10x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 88.32s | 86.46s | -2.1% | 78.78s | 76.99s | 2.84s | 2.83s | 4.44s | 4.33s | -2.4% | 86.46s | - | 1.02x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28487534239)

