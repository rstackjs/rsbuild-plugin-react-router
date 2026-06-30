<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `af7836d` against base `0f9b463`.

**Total median wall time:** 21.99s -> 23.28s (+5.9%, 0.94x speedup)
**Compiler ready median:** 14.93s -> 15.91s (+6.6%)
**Route load median:** 2.53s -> 2.88s (+14.0%)
**Update/HMR median:** 2.78s -> 2.67s (-4.1%)

### Production Build Benchmarks

Rendered 7 cold production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 1 | 6.40s | 6.54s | +2.1% | 6.54s | 6.54s | 0.98x | 1503 MB |
| `synthetic-1024-ssr-esm` | 1 | 2.62s | 2.60s | -0.9% | 2.60s | 2.60s | 1.01x | 610 MB |
| `synthetic-1024-ssr-esm-split` | 1 | 3.37s | 3.36s | -0.3% | 3.36s | 3.36s | 1.00x | 795 MB |
| `synthetic-256-sourcemaps` | 1 | 1.48s | 1.50s | +1.8% | 1.50s | 1.50s | 0.98x | 423 MB |
| `synthetic-256-ssr-esm` | 1 | 1.40s | 1.40s | +0.4% | 1.40s | 1.40s | 1.00x | 398 MB |
| `synthetic-256-ssr-esm-split` | 1 | 1.62s | 1.60s | -1.3% | 1.60s | 1.60s | 1.01x | 437 MB |
| `synthetic-48-ssr-esm` | 1 | 1.12s | 1.10s | -2.0% | 1.10s | 1.10s | 1.02x | 308 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 10.44s | 11.43s | +9.5% | 6.82s | 7.69s | 1.18s | 1.26s | 1.46s | 1.60s | +9.4% | 11.42s | 12.34s | 0.91x | - |
| `synthetic-1024-ssr-esm` | 5 | 3.44s | 3.34s | -2.9% | 2.44s | 2.44s | 0.34s | 0.41s | 0.33s | 0.33s | -0.9% | 3.39s | 3.74s | 1.03x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 3.11s | 3.34s | +7.6% | 2.28s | 2.30s | 0.34s | 0.38s | 0.30s | 0.30s | +0.1% | 3.24s | 3.42s | 0.93x | - |
| `synthetic-256-sourcemaps` | 5 | 1.66s | 1.46s | -11.6% | 1.12s | 1.10s | 0.16s | 0.19s | 0.28s | 0.10s | -62.9% | 1.49s | 1.56s | 1.13x | - |
| `synthetic-256-ssr-esm` | 5 | 1.32s | 1.52s | +14.7% | 0.92s | 0.95s | 0.20s | 0.28s | 0.13s | 0.11s | -18.2% | 1.52s | 1.76s | 0.87x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.30s | 1.38s | +6.0% | 0.89s | 0.93s | 0.20s | 0.25s | 0.13s | 0.10s | -20.0% | 1.40s | 1.48s | 0.94x | - |
| `synthetic-48-ssr-esm` | 5 | 0.73s | 0.81s | +11.0% | 0.46s | 0.49s | 0.10s | 0.11s | 0.15s | 0.13s | -16.0% | 0.80s | 0.95s | 0.90x | - |

#### large-355-ssr-esm Dev Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 1.06s | 1.13s | +6.4% | 1.13s | 1.14s | 10384 | 200 | 0 |
| `/route-0001` | 5 | 0.02s | 0.02s | +6.3% | 0.02s | 0.02s | 10997 | 200 | 0 |
| `/route-0002` | 5 | 0.01s | 0.02s | +29.1% | 0.02s | 0.02s | 10847 | 200 | 0 |
| `/route-0010` | 5 | 0.02s | 0.02s | +19.9% | 0.02s | 0.02s | 10919 | 200 | 0 |
| `/route-0050` | 5 | 0.02s | 0.02s | +16.7% | 0.02s | 0.02s | 10996 | 200 | 0 |
| `/route-0100` | 5 | 0.02s | 0.02s | +33.4% | 0.02s | 0.03s | 10846 | 200 | 0 |
| `/route-0200` | 5 | 0.02s | 0.02s | -0.3% | 0.02s | 0.02s | 10992 | 200 | 0 |
| `/route-0354` | 5 | 0.02s | 0.02s | +19.8% | 0.02s | 0.02s | 10840 | 200 | 0 |

#### synthetic-1024-ssr-esm Dev Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.15s | 0.17s | +8.8% | 0.18s | 0.20s | 2551 | 200 | 0 |
| `/route-0002` | 5 | 0.03s | 0.03s | +20.0% | 0.03s | 0.03s | 2932 | 200 | 0 |
| `/route-0003` | 5 | 0.04s | 0.04s | +8.5% | 0.04s | 0.05s | 2932 | 200 | 0 |
| `/route-0011` | 5 | 0.03s | 0.03s | -0.3% | 0.03s | 0.03s | 3010 | 200 | 0 |
| `/route-0051` | 5 | 0.02s | 0.03s | +19.6% | 0.03s | 0.03s | 2932 | 200 | 0 |
| `/route-0101` | 5 | 0.03s | 0.03s | +22.4% | 0.04s | 0.06s | 3010 | 200 | 0 |
| `/route-0201` | 5 | 0.02s | 0.03s | +18.3% | 0.03s | 0.03s | 2932 | 200 | 0 |
| `/route-1024` | 5 | 0.02s | 0.02s | +21.2% | 0.03s | 0.03s | 3010 | 200 | 0 |

#### synthetic-1024-ssr-esm-split Dev Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.15s | 0.16s | +5.9% | 0.17s | 0.18s | 2551 | 200 | 0 |
| `/route-0002` | 5 | 0.03s | 0.03s | +17.7% | 0.03s | 0.04s | 2932 | 200 | 0 |
| `/route-0003` | 5 | 0.04s | 0.04s | +6.8% | 0.04s | 0.04s | 2932 | 200 | 0 |
| `/route-0011` | 5 | 0.03s | 0.03s | +5.8% | 0.03s | 0.03s | 3010 | 200 | 0 |
| `/route-0051` | 5 | 0.02s | 0.03s | +10.2% | 0.03s | 0.03s | 2932 | 200 | 0 |
| `/route-0101` | 5 | 0.02s | 0.03s | +19.3% | 0.03s | 0.04s | 3010 | 200 | 0 |
| `/route-0201` | 5 | 0.02s | 0.03s | +20.8% | 0.03s | 0.06s | 2932 | 200 | 0 |
| `/route-1024` | 5 | 0.02s | 0.02s | +15.0% | 0.02s | 0.03s | 3010 | 200 | 0 |

#### synthetic-256-sourcemaps Dev Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.09s | 0.10s | +10.1% | 0.10s | 0.11s | 2551 | 200 | 0 |
| `/route-0002` | 5 | 0.01s | 0.01s | +19.9% | 0.01s | 0.01s | 2932 | 200 | 0 |
| `/route-0003` | 5 | 0.01s | 0.01s | +46.2% | 0.01s | 0.02s | 2932 | 200 | 0 |
| `/route-0011` | 5 | 0.01s | 0.01s | +1.9% | 0.01s | 0.01s | 3010 | 200 | 0 |
| `/route-0051` | 5 | 0.01s | 0.01s | +34.1% | 0.01s | 0.01s | 2932 | 200 | 0 |
| `/route-0101` | 5 | 0.01s | 0.01s | +15.2% | 0.01s | 0.01s | 3010 | 200 | 0 |
| `/route-0201` | 5 | 0.01s | 0.01s | +14.0% | 0.01s | 0.01s | 2932 | 200 | 0 |
| `/route-0256` | 5 | 0.01s | 0.01s | +8.2% | 0.01s | 0.01s | 3010 | 200 | 0 |

#### synthetic-256-ssr-esm Dev Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.10s | 0.14s | +40.6% | 0.14s | 0.15s | 2551 | 200 | 0 |
| `/route-0002` | 5 | 0.01s | 0.02s | +49.6% | 0.02s | 0.03s | 2932 | 200 | 0 |
| `/route-0003` | 5 | 0.01s | 0.02s | +19.1% | 0.02s | 0.02s | 2932 | 200 | 0 |
| `/route-0011` | 5 | 0.01s | 0.02s | +69.8% | 0.02s | 0.03s | 3010 | 200 | 0 |
| `/route-0051` | 5 | 0.02s | 0.02s | -3.4% | 0.02s | 0.02s | 2932 | 200 | 0 |
| `/route-0101` | 5 | 0.01s | 0.02s | +16.8% | 0.02s | 0.03s | 3010 | 200 | 0 |
| `/route-0201` | 5 | 0.01s | 0.02s | +90.2% | 0.02s | 0.03s | 2932 | 200 | 0 |
| `/route-0256` | 5 | 0.02s | 0.02s | +5.8% | 0.02s | 0.02s | 3010 | 200 | 0 |

#### synthetic-256-ssr-esm-split Dev Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.10s | 0.14s | +40.9% | 0.14s | 0.15s | 2551 | 200 | 0 |
| `/route-0002` | 5 | 0.02s | 0.02s | +10.4% | 0.02s | 0.02s | 2932 | 200 | 0 |
| `/route-0003` | 5 | 0.01s | 0.01s | +16.2% | 0.02s | 0.02s | 2932 | 200 | 0 |
| `/route-0011` | 5 | 0.01s | 0.02s | +28.8% | 0.02s | 0.02s | 3010 | 200 | 0 |
| `/route-0051` | 5 | 0.01s | 0.02s | +44.8% | 0.02s | 0.02s | 2932 | 200 | 0 |
| `/route-0101` | 5 | 0.02s | 0.02s | +31.0% | 0.02s | 0.03s | 3010 | 200 | 0 |
| `/route-0201` | 5 | 0.01s | 0.01s | +33.5% | 0.01s | 0.02s | 2932 | 200 | 0 |
| `/route-0256` | 5 | 0.01s | 0.02s | +12.5% | 0.02s | 0.02s | 3010 | 200 | 0 |

#### synthetic-48-ssr-esm Dev Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.06s | 0.07s | +16.0% | 0.07s | 0.08s | 2552 | 200 | 0 |
| `/route-0002` | 5 | 0.01s | 0.01s | +10.3% | 0.01s | 0.01s | 2933 | 200 | 0 |
| `/route-0003` | 5 | 0.01s | 0.01s | +27.2% | 0.01s | 0.01s | 2933 | 200 | 0 |
| `/route-0011` | 5 | 0.01s | 0.01s | +48.3% | 0.01s | 0.02s | 3011 | 200 | 0 |
| `/route-0048` | 5 | 0.01s | 0.01s | -5.4% | 0.01s | 0.01s | 2936 | 200 | 0 |

#### large-355-ssr-esm Dev Update Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.74s | 0.79s | +7.7% | 0.80s | 0.82s | 10384 | 200 | 0 |

#### synthetic-1024-ssr-esm Dev Update Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.10s | 0.15s | +58.0% | 0.13s | 0.16s | 2551 | 200 | 0 |

#### synthetic-1024-ssr-esm-split Dev Update Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.10s | 0.11s | +13.1% | 0.17s | 0.39s | 2552 | 200 | 0 |

#### synthetic-256-sourcemaps Dev Update Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.05s | 0.04s | -8.0% | 0.04s | 0.05s | 2551 | 200 | 0 |

#### synthetic-256-ssr-esm Dev Update Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.04s | 0.06s | +46.9% | 0.06s | 0.07s | 2551 | 200 | 0 |

#### synthetic-256-ssr-esm-split Dev Update Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.05s | 0.05s | +0.7% | 0.05s | 0.07s | 2552 | 200 | 0 |

#### synthetic-48-ssr-esm Dev Update Route Requests

| Route | Runs | Base median | Head median | Delta | Head mean | Head p95 | Head bytes | Statuses | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 5 | 0.02s | 0.03s | +39.2% | 0.03s | 0.04s | 2551 | 200 | 0 |

### Synthetic Rsbuild App

| Benchmark | Profile | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup | Runs |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | `cold` | 74.99s | 70.02s | -6.6% | - | - | - | - | - | - | - | - | - | 1.07x | 1 |
| complex app | `dev` | 63.45s | 60.87s | -4.1% | 56.65s | 54.41s | -4.0% | 1.70s | 1.64s | -3.7% | 3.91s | 3.67s | -6.3% | 1.04x | 1 |

Profile: `full`; mode: `dev`; iterations: `5`; warmup: `0`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28470074124)

