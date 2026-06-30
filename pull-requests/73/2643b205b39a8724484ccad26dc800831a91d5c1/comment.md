<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2643b20` against base `0f9b463`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 32.16s | 32.03s | -0.4% | 22.33s | 22.16s | -0.8% | 4.26s | 4.29s | +0.7% | 3.16s | 3.19s | +0.8% | 1.00x |
| Large app | 1 | 15.21s | 15.26s | +0.3% | 9.96s | 9.94s | -0.2% | 2.08s | 2.06s | -0.8% | 1.74s | 1.74s | -0.2% | 1.00x |
| Standard fixtures | 6 | 16.95s | 16.77s | -1.1% | 12.37s | 12.22s | -1.2% | 2.18s | 2.23s | +2.1% | 1.42s | 1.45s | +1.9% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.91s | 9.02s | +1.2% | 9.06s | 9.25s | 0.99x | 1501 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.32s | 4.32s | -0.2% | 4.36s | 4.60s | 1.00x | 618 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.81s | 5.65s | -2.8% | 5.74s | 6.02s | 1.03x | 784 MB |
| `synthetic-256-sourcemaps` | 10 | 2.35s | 2.33s | -0.9% | 2.34s | 2.49s | 1.01x | 439 MB |
| `synthetic-256-ssr-esm` | 10 | 2.18s | 2.19s | +0.3% | 2.21s | 2.34s | 1.00x | 395 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.64s | 2.59s | -2.1% | 2.59s | 2.72s | 1.02x | 423 MB |
| `synthetic-48-ssr-esm` | 10 | 1.56s | 1.55s | -0.8% | 1.56s | 1.76s | 1.01x | 304 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 15.21s | 15.26s | +0.3% | 9.96s | 9.94s | 2.08s | 2.06s | 1.74s | 1.74s | -0.2% | 15.24s | 15.66s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.70s | 4.69s | -0.2% | 3.48s | 3.44s | 0.54s | 0.54s | 0.45s | 0.48s | +5.8% | 4.78s | 5.12s | 1.00x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.91s | 4.85s | -1.2% | 3.56s | 3.56s | 0.55s | 0.55s | 0.48s | 0.48s | +0.1% | 4.90s | 5.23s | 1.01x | - |
| `synthetic-256-sourcemaps` | 10 | 2.26s | 2.28s | +0.7% | 1.72s | 1.70s | 0.30s | 0.30s | 0.13s | 0.15s | +16.1% | 2.28s | 2.36s | 0.99x | - |
| `synthetic-256-ssr-esm` | 10 | 2.01s | 1.98s | -1.9% | 1.43s | 1.41s | 0.32s | 0.33s | 0.13s | 0.13s | +0.0% | 1.97s | 2.05s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.01s | 1.95s | -3.1% | 1.42s | 1.37s | 0.32s | 0.34s | 0.15s | 0.13s | -13.4% | 1.95s | 2.00s | 1.03x | - |
| `synthetic-48-ssr-esm` | 10 | 1.05s | 1.02s | -3.0% | 0.77s | 0.72s | 0.15s | 0.15s | 0.08s | 0.08s | -0.8% | 1.03s | 1.10s | 1.03x | - |

### Synthetic Rsbuild App

Rendered 1 production build benchmark.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 1 | 109.63s | 104.15s | -5.0% | 104.15s | - | 1.05x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 1 | 91.23s | 89.06s | -2.4% | 82.58s | 80.37s | 3.07s | 3.05s | 3.35s | 3.43s | +2.5% | 89.06s | - | 1.02x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28478752157)

