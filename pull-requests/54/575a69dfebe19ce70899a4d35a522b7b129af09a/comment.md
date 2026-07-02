<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `575a69d` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 20.43s | 19.54s | -4.3% | 13.68s | 12.88s | -5.8% | 2.49s | 2.52s | +1.2% | 2.42s | 2.49s | +2.9% | 1.05x |
| Large app | 1 | 10.01s | 9.70s | -3.1% | 6.32s | 6.05s | -4.2% | 1.13s | 1.18s | +4.9% | 1.46s | 1.48s | +1.8% | 1.03x |
| Standard fixtures | 6 | 10.42s | 9.85s | -5.5% | 7.36s | 6.82s | -7.3% | 1.36s | 1.33s | -1.9% | 0.97s | 1.01s | +4.6% | 1.06x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 6.25s | 5.99s | -4.2% | 5.97s | 6.11s | 1.04x | 1459 MB |
| `synthetic-1024-ssr-esm` | 5 | 2.33s | 2.50s | +7.0% | 2.48s | 2.59s | 0.93x | 539 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 3.16s | 3.18s | +0.8% | 3.21s | 3.37s | 0.99x | 675 MB |
| `synthetic-256-sourcemaps` | 10 | 1.36s | 1.27s | -6.9% | 1.28s | 1.42s | 1.07x | 395 MB |
| `synthetic-256-ssr-esm` | 10 | 1.28s | 1.18s | -7.5% | 1.18s | 1.27s | 1.08x | 374 MB |
| `synthetic-256-ssr-esm-split` | 10 | 1.46s | 1.40s | -4.7% | 1.39s | 1.47s | 1.05x | 409 MB |
| `synthetic-48-ssr-esm` | 10 | 0.96s | 0.78s | -18.1% | 0.80s | 0.91s | 1.22x | 312 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 10.01s | 9.70s | -3.1% | 6.32s | 6.05s | 1.13s | 1.18s | 1.46s | 1.48s | +1.8% | 9.54s | 9.98s | 1.03x | - |
| `synthetic-1024-ssr-esm` | 5 | 2.94s | 2.75s | -6.4% | 2.12s | 1.95s | 0.32s | 0.38s | 0.30s | 0.30s | -0.1% | 2.79s | 2.98s | 1.07x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 2.93s | 2.92s | -0.5% | 2.04s | 1.98s | 0.33s | 0.39s | 0.28s | 0.33s | +17.7% | 2.91s | 3.13s | 1.00x | - |
| `synthetic-256-sourcemaps` | 10 | 1.42s | 1.37s | -4.0% | 1.06s | 0.98s | 0.17s | 0.15s | 0.13s | 0.10s | -18.5% | 1.37s | 1.62s | 1.04x | - |
| `synthetic-256-ssr-esm` | 10 | 1.24s | 1.12s | -10.0% | 0.83s | 0.76s | 0.22s | 0.16s | 0.11s | 0.13s | +18.3% | 1.11s | 1.15s | 1.11x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.22s | 1.14s | -6.4% | 0.84s | 0.78s | 0.22s | 0.16s | 0.10s | 0.10s | -0.4% | 1.15s | 1.40s | 1.07x | - |
| `synthetic-48-ssr-esm` | 10 | 0.67s | 0.55s | -17.1% | 0.46s | 0.38s | 0.09s | 0.08s | 0.05s | 0.05s | -1.1% | 0.56s | 0.59s | 1.21x | - |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 74.03s | 75.44s | +1.9% | 75.44s | - | 0.98x | - |
| complex app | 2 | 49.82s | 51.15s | +2.7% | 51.15s | - | 0.97x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 67.45s | 68.06s | +0.9% | 61.08s | 61.45s | 1.56s | 1.59s | 3.49s | 3.55s | +1.8% | 68.06s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28566163770)

