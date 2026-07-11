<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e5dc8b6` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.53s | 8.55s | +0.3% | 0.4% | 0.2% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.09s | 4.30s | +5.2% | 0.1% | 0.2% | ±2.0% | 🔴 regression |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.58s | 5.67s | +1.7% | 0.1% | 1.0% | ±3.0% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (build)` | 5 | 2.24s | 2.19s | -2.3% | 0.1% | 0.8% | ±2.3% | 🟢 improvement |
| `synthetic-256-ssr-esm (build)` | 5 | 2.09s | 2.06s | -1.5% | 0.9% | 1.9% | ±6.1% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.50s | 2.46s | -1.5% | 0.0% | 0.3% | ±2.0% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.37s | 1.36s | -0.8% | 1.1% | 1.1% | ±4.7% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 15.57s | 14.99s | -3.7% | 1.5% | 0.3% | ±4.5% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.74s | 5.18s | +9.4% | 0.4% | 0.1% | ±2.0% | 🔴 regression |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.83s | 5.18s | +7.3% | 0.3% | 1.5% | ±4.5% | 🔴 regression |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.11s | 2.14s | +1.6% | 0.9% | 0.3% | ±2.7% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.89s | 2.02s | +7.2% | 1.3% | 0.9% | ±4.6% | 🔴 regression |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.83s | 2.03s | +11.0% | 0.6% | 0.6% | ±2.6% | 🔴 regression |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.95s | 0.90s | -5.7% | 0.5% | 0.7% | ±2.5% | 🟢 improvement |
| `complex app (cold)` | 3 | 113.10s | 114.14s | +0.9% | 0.6% | 0.4% | ±2.0% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 100.33s | 99.12s | -1.2% | 0.2% | 0.4% | ±2.0% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 79.19s | 82.25s | +3.9% | 0.3% | 0.8% | ±2.7% | 🔴 regression |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.91s | 32.45s | +1.7% | 19.60s | 21.15s | +7.9% | 3.98s | 4.06s | +2.0% | 2.92s | 2.63s | -10.1% | 0.98x |
| Large app | 1 | 15.57s | 14.99s | -3.7% | 8.24s | 8.48s | +3.0% | 1.94s | 2.00s | +2.6% | 1.72s | 1.55s | -9.9% | 1.04x |
| Standard fixtures | 6 | 16.34s | 17.46s | +6.8% | 11.36s | 12.67s | +11.5% | 2.03s | 2.06s | +1.4% | 1.21s | 1.08s | -10.4% | 0.94x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.53s | 8.55s | +0.3% | 8.53s | 8.57s | 1.00x | 1456 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.09s | 4.30s | +5.2% | 4.34s | 4.43s | 0.95x | 541 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.58s | 5.67s | +1.7% | 5.64s | 5.73s | 0.98x | 650 MB |
| `synthetic-256-sourcemaps` | 5 | 2.24s | 2.19s | -2.3% | 2.18s | 2.20s | 1.02x | 377 MB |
| `synthetic-256-ssr-esm` | 5 | 2.09s | 2.06s | -1.5% | 2.06s | 2.11s | 1.02x | 363 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.50s | 2.46s | -1.5% | 2.45s | 2.47s | 1.02x | 368 MB |
| `synthetic-48-ssr-esm` | 5 | 1.37s | 1.36s | -0.8% | 1.36s | 1.38s | 1.01x | 304 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 15.57s | 14.99s | -3.7% | 8.24s | 8.48s | 1.94s | 2.00s | 1.72s | 1.55s | -9.9% | 14.98s | 15.03s | 1.04x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.74s | 5.18s | +9.4% | 3.27s | 3.76s | 0.60s | 0.59s | 0.35s | 0.33s | -7.1% | 5.18s | 5.18s | 0.91x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.83s | 5.18s | +7.3% | 3.35s | 3.74s | 0.59s | 0.59s | 0.35s | 0.33s | -7.6% | 5.18s | 5.26s | 0.93x | - |
| `synthetic-256-sourcemaps` | 5 | 2.11s | 2.14s | +1.6% | 1.52s | 1.59s | 0.25s | 0.26s | 0.15s | 0.13s | -16.1% | 2.15s | 2.18s | 0.98x | - |
| `synthetic-256-ssr-esm` | 5 | 1.89s | 2.02s | +7.2% | 1.29s | 1.48s | 0.23s | 0.25s | 0.15s | 0.13s | -16.0% | 2.03s | 2.07s | 0.93x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.83s | 2.03s | +11.0% | 1.27s | 1.48s | 0.23s | 0.25s | 0.15s | 0.13s | -16.4% | 2.03s | 2.09s | 0.90x | - |
| `synthetic-48-ssr-esm` | 5 | 0.95s | 0.90s | -5.7% | 0.67s | 0.63s | 0.12s | 0.13s | 0.05s | 0.05s | -0.8% | 0.90s | 0.91s | 1.06x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1048.6ms | 2890.6ms | +175.7% | 2890.6ms | 25.7ms | 20 |
| node | `route:module` | 1071 | 600.7ms | 971.0ms | +61.6% | 971.0ms | 8.8ms | 42 |
| web | `route:client-entry` | 1071 | 272.1ms | 253.4ms | -6.9% | 253.4ms | 5.6ms | 6 |
| node | `manifest:transform` | 3 | 73.8ms | 63.0ms | -14.6% | 63.0ms | 24.8ms | 3 |
| web | `manifest:stage` | 6 | 12.1ms | 8.6ms | -28.9% | 8.6ms | 1.9ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1219.0ms | 2196.0ms | +80.1% | 2196.0ms | 14.2ms | 27 |
| node | `route:module` | 3078 | 539.5ms | 994.5ms | +84.3% | 994.5ms | 7.2ms | 24 |
| web | `route:client-entry` | 3078 | 379.0ms | 375.5ms | -0.9% | 375.5ms | 6.3ms | 6 |
| node | `manifest:transform` | 3 | 127.4ms | 130.1ms | +2.1% | 130.1ms | 45.0ms | 3 |
| node | `module:client-only-stub` | 3 | 72.6ms | 19.4ms | -73.3% | 19.4ms | 8.2ms | 3 |
| web | `manifest:stage` | 6 | 40.9ms | 35.7ms | -12.7% | 35.7ms | 6.9ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1271.5ms | 2200.4ms | +73.1% | 2200.4ms | 34.5ms | 26 |
| node | `route:module` | 3078 | 575.5ms | 1061.5ms | +84.4% | 1061.5ms | 6.4ms | 24 |
| web | `route:client-entry` | 3078 | 383.8ms | 416.9ms | +8.6% | 416.9ms | 7.6ms | 6 |
| node | `manifest:transform` | 3 | 129.5ms | 125.2ms | -3.3% | 125.2ms | 45.5ms | 3 |
| node | `module:client-only-stub` | 3 | 100.6ms | 25.4ms | -74.8% | 25.4ms | 12.8ms | 3 |
| web | `manifest:stage` | 6 | 38.5ms | 27.7ms | -28.1% | 27.7ms | 6.7ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 718.9ms | 1511.8ms | +110.3% | 1511.8ms | 33.7ms | 20 |
| node | `route:module` | 1290 | 303.4ms | 582.8ms | +92.1% | 582.8ms | 4.6ms | 35 |
| web | `route:client-entry` | 1290 | 206.3ms | 203.1ms | -1.6% | 203.1ms | 4.9ms | 10 |
| node | `manifest:transform` | 5 | 76.7ms | 77.0ms | +0.4% | 77.0ms | 19.4ms | 5 |
| node | `module:client-only-stub` | 5 | 69.6ms | 38.9ms | -44.1% | 38.9ms | 14.3ms | 5 |
| web | `manifest:stage` | 11 | 14.3ms | 10.5ms | -26.6% | 10.5ms | 1.3ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 712.3ms | 1455.4ms | +104.3% | 1455.4ms | 27.7ms | 21 |
| node | `route:module` | 1290 | 266.8ms | 545.9ms | +104.6% | 545.9ms | 3.4ms | 32 |
| web | `route:client-entry` | 1291 | 213.7ms | 209.1ms | -2.2% | 209.1ms | 5.0ms | 11 |
| node | `manifest:transform` | 5 | 96.7ms | 67.7ms | -30.0% | 67.7ms | 17.3ms | 5 |
| node | `module:client-only-stub` | 5 | 46.6ms | 33.3ms | -28.5% | 33.3ms | 11.8ms | 5 |
| web | `manifest:stage` | 11 | 14.7ms | 13.7ms | -6.8% | 13.7ms | 4.0ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1292 | 679.1ms | 1474.4ms | +117.1% | 1474.4ms | 21.0ms | 22 |
| node | `route:module` | 1290 | 287.7ms | 529.4ms | +84.0% | 529.4ms | 3.7ms | 35 |
| web | `route:client-entry` | 1292 | 219.0ms | 211.8ms | -3.3% | 211.8ms | 5.5ms | 12 |
| node | `module:client-only-stub` | 5 | 81.1ms | 41.2ms | -49.2% | 41.2ms | 16.3ms | 5 |
| node | `manifest:transform` | 5 | 67.2ms | 83.9ms | +24.9% | 83.9ms | 21.6ms | 5 |
| web | `manifest:stage` | 12 | 14.6ms | 14.2ms | -2.7% | 14.2ms | 3.9ms | 12 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 251 | 255.1ms | 196.1ms | -23.1% | 196.1ms | 9.9ms | 11 |
| node | `route:module` | 250 | 84.5ms | 76.3ms | -9.7% | 76.3ms | 0.6ms | 10 |
| web | `route:client-entry` | 251 | 62.3ms | 53.7ms | -13.8% | 53.7ms | 3.4ms | 11 |
| node | `module:client-only-stub` | 5 | 43.5ms | 33.4ms | -23.2% | 33.4ms | 12.8ms | 5 |
| node | `manifest:transform` | 5 | 25.8ms | 28.7ms | +11.2% | 28.7ms | 6.6ms | 5 |
| web | `manifest:stage` | 11 | 3.5ms | 2.9ms | -17.1% | 2.9ms | 0.4ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 113.10s | 114.14s | +0.9% | 114.01s | - | 0.99x | - |
| complex app | 3 | 79.19s | 82.25s | +3.9% | 81.89s | - | 0.96x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 100.33s | 99.12s | -1.2% | 89.43s | 89.21s | 2.90s | 3.12s | 3.37s | 2.43s | -27.9% | 99.13s | - | 1.01x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29136187395)

