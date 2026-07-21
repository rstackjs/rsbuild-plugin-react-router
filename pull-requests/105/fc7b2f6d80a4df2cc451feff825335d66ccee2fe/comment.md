<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `fc7b2f6` against base `dde2a2d`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.64s | 8.54s | -1.1% | 0.5% | 0.2% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.17s | 4.22s | +1.1% | 0.3% | 0.8% | ±2.5% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.63s | 5.54s | -1.7% | 0.1% | 1.0% | ±2.9% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (build)` | 5 | 2.25s | 2.23s | -1.0% | 1.1% | 0.6% | ±3.8% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.13s | 2.14s | +0.3% | 0.8% | 0.5% | ±2.7% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.51s | 2.50s | -0.4% | 0.3% | 0.7% | ±2.2% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.36s | 1.36s | -0.0% | 0.5% | 0.5% | ±2.1% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 14.25s | 14.28s | +0.2% | 0.1% | 0.4% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.63s | 4.48s | -3.3% | 3.2% | 0.0% | ±9.4% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.54s | 4.53s | -0.1% | 0.0% | 1.0% | ±3.1% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 1.98s | 1.99s | +0.7% | 0.4% | 0.8% | ±2.6% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.81s | 1.77s | -2.2% | 0.6% | 1.0% | ±3.4% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.81s | 1.76s | -2.9% | 1.1% | 0.9% | ±4.2% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.97s | 0.90s | -6.9% | 0.5% | 0.4% | ±2.0% | 🟢 improvement |
| `complex app (cold)` | 3 | 112.90s | 118.90s | +5.3% | 0.2% | 0.9% | ±2.7% | 🔴 regression |
| `complex app (dev)` | 3 | 94.37s | 94.82s | +0.5% | 0.7% | 0.1% | ±2.0% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 82.96s | 83.37s | +0.5% | 4.0% | 0.8% | ±12.1% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.98s | 29.71s | -0.9% | 18.76s | 18.51s | -1.4% | 4.00s | 3.99s | -0.2% | 2.68s | 2.65s | -1.0% | 1.01x |
| Large app | 1 | 14.25s | 14.28s | +0.2% | 7.84s | 7.79s | -0.7% | 1.93s | 1.99s | +3.0% | 1.54s | 1.54s | +0.1% | 1.00x |
| Standard fixtures | 6 | 15.73s | 15.43s | -1.9% | 10.92s | 10.72s | -1.8% | 2.07s | 2.00s | -3.3% | 1.14s | 1.11s | -2.5% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.64s | 8.54s | -1.1% | 8.61s | 8.77s | 1.01x | 1492 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.17s | 4.22s | +1.1% | 4.20s | 4.25s | 0.99x | 636 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.63s | 5.54s | -1.7% | 5.54s | 5.61s | 1.02x | 797 MB |
| `synthetic-256-sourcemaps` | 5 | 2.25s | 2.23s | -1.0% | 2.23s | 2.25s | 1.01x | 442 MB |
| `synthetic-256-ssr-esm` | 5 | 2.13s | 2.14s | +0.3% | 2.14s | 2.18s | 1.00x | 430 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.51s | 2.50s | -0.4% | 2.50s | 2.52s | 1.00x | 438 MB |
| `synthetic-48-ssr-esm` | 5 | 1.36s | 1.36s | -0.0% | 1.36s | 1.38s | 1.00x | 294 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 14.25s | 14.28s | +0.2% | 7.84s | 7.79s | 1.93s | 1.99s | 1.54s | 1.54s | +0.1% | 14.29s | 14.35s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.63s | 4.48s | -3.3% | 3.18s | 3.09s | 0.59s | 0.57s | 0.35s | 0.33s | -7.2% | 4.48s | 4.49s | 1.03x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.54s | 4.53s | -0.1% | 3.12s | 3.12s | 0.58s | 0.55s | 0.35s | 0.35s | -0.3% | 4.52s | 4.58s | 1.00x | - |
| `synthetic-256-sourcemaps` | 5 | 1.98s | 1.99s | +0.7% | 1.42s | 1.44s | 0.25s | 0.24s | 0.13s | 0.13s | -0.7% | 1.98s | 2.02s | 0.99x | - |
| `synthetic-256-ssr-esm` | 5 | 1.81s | 1.77s | -2.2% | 1.27s | 1.23s | 0.26s | 0.26s | 0.13s | 0.13s | +0.4% | 1.78s | 1.84s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.81s | 1.76s | -2.9% | 1.25s | 1.21s | 0.25s | 0.25s | 0.13s | 0.13s | -0.3% | 1.78s | 1.84s | 1.03x | - |
| `synthetic-48-ssr-esm` | 5 | 0.97s | 0.90s | -6.9% | 0.68s | 0.63s | 0.13s | 0.13s | 0.05s | 0.05s | -1.9% | 0.90s | 0.92s | 1.07x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1089.3ms | 1064.4ms | -2.3% | 1064.4ms | 13.4ms | 6 |
| node | `route:module` | 1071 | 524.1ms | 542.6ms | +3.5% | 542.6ms | 6.1ms | 6 |
| web | `route:client-entry` | 1071 | 269.5ms | 258.1ms | -4.2% | 258.1ms | 5.8ms | 6 |
| node | `manifest:transform` | 3 | 60.6ms | 109.7ms | +81.0% | 109.7ms | 56.8ms | 3 |
| web | `manifest:stage` | 6 | 8.7ms | 8.9ms | +2.3% | 8.9ms | 1.9ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1220.7ms | 1241.0ms | +1.7% | 1241.0ms | 15.3ms | 6 |
| node | `route:module` | 3078 | 555.0ms | 557.0ms | +0.4% | 557.0ms | 6.4ms | 6 |
| web | `route:client-entry` | 3078 | 413.5ms | 401.0ms | -3.0% | 401.0ms | 7.4ms | 6 |
| node | `manifest:transform` | 3 | 130.1ms | 133.2ms | +2.4% | 133.2ms | 45.5ms | 3 |
| web | `manifest:stage` | 6 | 32.8ms | 29.6ms | -9.8% | 29.6ms | 8.0ms | 6 |
| node | `module:client-only-stub` | 3 | 31.2ms | 54.8ms | +75.6% | 54.8ms | 25.7ms | 3 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1237.0ms | 1229.4ms | -0.6% | 1229.4ms | 10.1ms | 6 |
| node | `route:module` | 3078 | 565.3ms | 592.1ms | +4.7% | 592.1ms | 11.5ms | 6 |
| node | `module:client-only-stub` | 3 | 427.1ms | 139.0ms | -67.5% | 139.0ms | 63.4ms | 3 |
| web | `route:client-entry` | 3078 | 377.9ms | 405.5ms | +7.3% | 405.5ms | 6.6ms | 6 |
| node | `manifest:transform` | 3 | 127.3ms | 153.5ms | +20.6% | 153.5ms | 73.7ms | 3 |
| web | `manifest:stage` | 6 | 33.8ms | 31.9ms | -5.6% | 31.9ms | 8.1ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 737.8ms | 755.5ms | +2.4% | 755.5ms | 11.2ms | 11 |
| node | `route:module` | 1290 | 305.4ms | 325.3ms | +6.5% | 325.3ms | 4.9ms | 10 |
| web | `route:client-entry` | 1291 | 212.9ms | 207.2ms | -2.7% | 207.2ms | 5.5ms | 11 |
| node | `manifest:transform` | 5 | 76.1ms | 89.9ms | +18.1% | 89.9ms | 21.6ms | 5 |
| node | `module:client-only-stub` | 5 | 41.0ms | 161.0ms | +292.7% | 161.0ms | 63.3ms | 5 |
| web | `manifest:stage` | 11 | 10.9ms | 11.5ms | +5.5% | 11.5ms | 1.4ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 678.6ms | 705.9ms | +4.0% | 705.9ms | 16.7ms | 11 |
| node | `route:module` | 1290 | 289.1ms | 284.1ms | -1.7% | 284.1ms | 5.3ms | 10 |
| web | `route:client-entry` | 1291 | 197.0ms | 215.1ms | +9.2% | 215.1ms | 5.4ms | 11 |
| node | `module:client-only-stub` | 5 | 106.4ms | 79.2ms | -25.6% | 79.2ms | 40.7ms | 5 |
| node | `manifest:transform` | 5 | 75.1ms | 84.0ms | +11.9% | 84.0ms | 22.8ms | 5 |
| web | `manifest:stage` | 11 | 10.5ms | 11.4ms | +8.6% | 11.4ms | 1.4ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 704.9ms | 716.1ms | +1.6% | 716.1ms | 21.1ms | 11 |
| node | `route:module` | 1290 | 280.6ms | 290.2ms | +3.4% | 290.2ms | 4.6ms | 10 |
| web | `route:client-entry` | 1291 | 218.4ms | 198.8ms | -9.0% | 198.8ms | 5.2ms | 11 |
| node | `module:client-only-stub` | 5 | 105.6ms | 106.0ms | +0.4% | 106.0ms | 51.2ms | 5 |
| node | `manifest:transform` | 5 | 84.7ms | 77.7ms | -8.3% | 77.7ms | 17.0ms | 5 |
| web | `manifest:stage` | 11 | 11.4ms | 11.3ms | -0.9% | 11.3ms | 1.4ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 236.7ms | 196.9ms | -16.8% | 196.9ms | 8.8ms | 10 |
| node | `route:module` | 250 | 85.0ms | 81.7ms | -3.9% | 81.7ms | 2.0ms | 10 |
| web | `route:client-entry` | 250 | 67.9ms | 59.9ms | -11.8% | 59.9ms | 3.6ms | 10 |
| node | `module:client-only-stub` | 5 | 37.7ms | 52.6ms | +39.5% | 52.6ms | 19.2ms | 5 |
| node | `manifest:transform` | 5 | 30.6ms | 28.7ms | -6.2% | 28.7ms | 6.8ms | 5 |
| web | `manifest:stage` | 10 | 2.6ms | 2.8ms | +7.7% | 2.8ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 112.90s | 118.90s | +5.3% | 118.80s | - | 0.95x | - |
| complex app | 3 | 82.96s | 83.37s | +0.5% | 83.42s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 94.37s | 94.82s | +0.5% | 85.27s | 86.03s | 2.81s | 2.83s | 2.33s | 2.35s | +0.9% | 95.56s | - | 1.00x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29872330756)

