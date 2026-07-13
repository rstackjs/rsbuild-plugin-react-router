<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `eb73d92` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.28s | 8.23s | -0.6% | 1.3% | 0.4% | ±4.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 3.72s | 3.77s | +1.2% | 0.9% | 0.2% | ±2.8% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 4.95s | 4.92s | -0.7% | 0.9% | 0.5% | ±2.9% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (build)` | 5 | 2.22s | 2.20s | -0.7% | 1.1% | 1.3% | ±5.0% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.10s | 2.06s | -2.2% | 1.0% | 0.4% | ±3.2% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.52s | 2.53s | +0.2% | 0.6% | 0.3% | ±2.0% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.36s | 1.34s | -1.1% | 0.8% | 1.2% | ±4.2% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 14.80s | 14.81s | +0.1% | 0.4% | 1.3% | ±4.1% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.40s | 4.33s | -1.5% | 0.3% | 0.5% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.41s | 4.30s | -2.7% | 0.1% | 0.1% | ±2.0% | 🟢 improvement |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.14s | 2.11s | -1.0% | 0.1% | 0.4% | ±2.0% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.90s | 1.86s | -1.9% | 1.7% | 0.6% | ±5.3% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.88s | 1.93s | +2.4% | 1.0% | 1.7% | ±5.9% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.99s | 0.92s | -6.7% | 0.6% | 0.8% | ±2.9% | 🟢 improvement |
| `complex app (cold)` | 3 | 129.09s | 122.25s | -5.3% | 4.0% | 0.5% | ±12.1% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 103.82s | 105.26s | +1.4% | 0.3% | 0.1% | ±2.0% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 81.28s | 91.88s | +13.0% | 1.5% | 3.9% | ±12.5% | 🔴 regression |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.51s | 30.26s | -0.8% | 18.66s | 18.40s | -1.4% | 3.91s | 3.87s | -1.1% | 2.86s | 2.78s | -2.6% | 1.01x |
| Large app | 1 | 14.80s | 14.81s | +0.1% | 7.87s | 7.82s | -0.6% | 1.86s | 1.85s | -0.7% | 1.69s | 1.67s | -1.2% | 1.00x |
| Standard fixtures | 6 | 15.71s | 15.45s | -1.7% | 10.79s | 10.58s | -1.9% | 2.05s | 2.02s | -1.4% | 1.17s | 1.11s | -4.7% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.28s | 8.23s | -0.6% | 8.20s | 8.26s | 1.01x | 1482 MB |
| `synthetic-1024-ssr-esm` | 3 | 3.72s | 3.77s | +1.2% | 3.76s | 3.78s | 0.99x | 640 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 4.95s | 4.92s | -0.7% | 4.91s | 4.94s | 1.01x | 801 MB |
| `synthetic-256-sourcemaps` | 5 | 2.22s | 2.20s | -0.7% | 2.20s | 2.23s | 1.01x | 422 MB |
| `synthetic-256-ssr-esm` | 5 | 2.10s | 2.06s | -2.2% | 2.06s | 2.10s | 1.02x | 419 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.52s | 2.53s | +0.2% | 2.52s | 2.54s | 1.00x | 435 MB |
| `synthetic-48-ssr-esm` | 5 | 1.36s | 1.34s | -1.1% | 1.34s | 1.39s | 1.01x | 287 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 14.80s | 14.81s | +0.1% | 7.87s | 7.82s | 1.86s | 1.85s | 1.69s | 1.67s | -1.2% | 14.99s | 15.55s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.40s | 4.33s | -1.5% | 3.00s | 2.98s | 0.58s | 0.55s | 0.33s | 0.33s | -0.3% | 4.33s | 4.36s | 1.02x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.41s | 4.30s | -2.7% | 2.99s | 2.93s | 0.58s | 0.56s | 0.33s | 0.30s | -7.7% | 4.27s | 4.30s | 1.03x | - |
| `synthetic-256-sourcemaps` | 5 | 2.14s | 2.11s | -1.0% | 1.53s | 1.50s | 0.26s | 0.26s | 0.15s | 0.15s | -1.2% | 2.10s | 2.12s | 1.01x | - |
| `synthetic-256-ssr-esm` | 5 | 1.90s | 1.86s | -1.9% | 1.30s | 1.27s | 0.25s | 0.26s | 0.15s | 0.13s | -16.4% | 1.86s | 1.90s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.88s | 1.93s | +2.4% | 1.30s | 1.28s | 0.25s | 0.26s | 0.15s | 0.13s | -16.8% | 1.90s | 1.96s | 0.98x | - |
| `synthetic-48-ssr-esm` | 5 | 0.99s | 0.92s | -6.7% | 0.67s | 0.62s | 0.13s | 0.13s | 0.05s | 0.08s | +47.1% | 0.93s | 0.94s | 1.07x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1089.1ms | 1017.2ms | -6.6% | 1017.2ms | 11.1ms | 6 |
| node | `route:module` | 1071 | 493.1ms | 526.4ms | +6.8% | 526.4ms | 7.5ms | 6 |
| web | `route:client-entry` | 1071 | 241.4ms | 220.7ms | -8.6% | 220.7ms | 4.9ms | 6 |
| node | `manifest:transform` | 3 | 64.7ms | 81.3ms | +25.7% | 81.3ms | 33.5ms | 3 |
| web | `manifest:stage` | 9 | 12.4ms | 12.3ms | -0.8% | 12.3ms | 1.9ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1196.2ms | 1222.4ms | +2.2% | 1222.4ms | 16.7ms | 6 |
| node | `route:module` | 3078 | 570.7ms | 578.4ms | +1.3% | 578.4ms | 6.1ms | 6 |
| web | `route:client-entry` | 3078 | 330.0ms | 337.0ms | +2.1% | 337.0ms | 5.8ms | 6 |
| node | `manifest:transform` | 3 | 106.6ms | 116.9ms | +9.7% | 116.9ms | 42.7ms | 3 |
| node | `module:client-only-stub` | 3 | 48.2ms | 45.0ms | -6.6% | 45.0ms | 20.4ms | 3 |
| web | `manifest:stage` | 9 | 42.1ms | 43.5ms | +3.3% | 43.5ms | 7.6ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1237.1ms | 1171.8ms | -5.3% | 1171.8ms | 15.5ms | 6 |
| node | `route:module` | 3078 | 563.0ms | 562.0ms | -0.2% | 562.0ms | 6.4ms | 6 |
| web | `route:client-entry` | 3078 | 334.8ms | 366.2ms | +9.4% | 366.2ms | 6.5ms | 6 |
| node | `module:client-only-stub` | 3 | 174.0ms | 46.5ms | -73.3% | 46.5ms | 19.2ms | 3 |
| node | `manifest:transform` | 3 | 123.2ms | 118.9ms | -3.5% | 118.9ms | 41.5ms | 3 |
| web | `manifest:stage` | 9 | 44.0ms | 48.7ms | +10.7% | 48.7ms | 7.7ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 765.6ms | 784.7ms | +2.5% | 784.7ms | 23.4ms | 10 |
| node | `route:module` | 1290 | 319.7ms | 316.7ms | -0.9% | 316.7ms | 3.5ms | 10 |
| web | `route:client-entry` | 1290 | 210.8ms | 216.5ms | +2.7% | 216.5ms | 5.4ms | 10 |
| node | `module:client-only-stub` | 5 | 170.1ms | 294.8ms | +73.3% | 294.8ms | 119.2ms | 5 |
| node | `manifest:transform` | 5 | 71.1ms | 101.8ms | +43.2% | 101.8ms | 24.8ms | 5 |
| web | `manifest:stage` | 15 | 20.6ms | 15.3ms | -25.7% | 15.3ms | 1.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 699.2ms | 750.8ms | +7.4% | 750.8ms | 21.3ms | 10 |
| node | `route:module` | 1290 | 294.9ms | 280.9ms | -4.7% | 280.9ms | 4.7ms | 10 |
| web | `route:client-entry` | 1290 | 211.0ms | 222.6ms | +5.5% | 222.6ms | 5.7ms | 10 |
| node | `manifest:transform` | 5 | 88.3ms | 67.6ms | -23.4% | 67.6ms | 21.4ms | 5 |
| node | `module:client-only-stub` | 5 | 85.4ms | 21.9ms | -74.4% | 21.9ms | 10.0ms | 5 |
| web | `manifest:stage` | 15 | 14.8ms | 15.4ms | +4.1% | 15.4ms | 1.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 725.6ms | 757.9ms | +4.5% | 757.9ms | 11.2ms | 10 |
| node | `route:module` | 1290 | 288.0ms | 282.6ms | -1.9% | 282.6ms | 4.6ms | 10 |
| web | `route:client-entry` | 1290 | 214.2ms | 201.7ms | -5.8% | 201.7ms | 5.8ms | 10 |
| node | `manifest:transform` | 5 | 84.8ms | 83.6ms | -1.4% | 83.6ms | 21.9ms | 5 |
| node | `module:client-only-stub` | 5 | 67.6ms | 20.4ms | -69.8% | 20.4ms | 10.0ms | 5 |
| web | `manifest:stage` | 15 | 15.0ms | 15.2ms | +1.3% | 15.2ms | 1.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 261.9ms | 227.5ms | -13.1% | 227.5ms | 11.5ms | 10 |
| node | `route:module` | 250 | 82.1ms | 84.7ms | +3.2% | 84.7ms | 1.4ms | 10 |
| web | `route:client-entry` | 250 | 61.6ms | 59.7ms | -3.1% | 59.7ms | 3.8ms | 10 |
| node | `module:client-only-stub` | 5 | 39.7ms | 57.5ms | +44.8% | 57.5ms | 17.8ms | 5 |
| node | `manifest:transform` | 5 | 32.9ms | 31.5ms | -4.3% | 31.5ms | 9.3ms | 5 |
| web | `manifest:stage` | 15 | 3.8ms | 3.9ms | +2.6% | 3.9ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 129.09s | 122.25s | -5.3% | 120.02s | - | 1.06x | - |
| complex app | 3 | 81.28s | 91.88s | +13.0% | 91.98s | - | 0.88x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 103.82s | 105.26s | +1.4% | 92.72s | 94.16s | 3.07s | 3.03s | 3.39s | 3.46s | +2.1% | 105.46s | - | 0.99x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29280514202)

