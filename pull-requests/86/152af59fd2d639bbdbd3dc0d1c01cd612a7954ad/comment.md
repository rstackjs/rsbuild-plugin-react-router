<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `152af59` against base `94ed3cc`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.46s | 8.94s | +5.6% | 0.3% | 0.6% | ±2.1% | 🔴 regression |
| `synthetic-1024-ssr-esm (build)` | 3 | 3.95s | 4.76s | +20.5% | 0.8% | 1.3% | ±4.6% | 🔴 regression |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.23s | 5.98s | +14.4% | 0.6% | 0.0% | ±2.0% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.21s | 2.45s | +11.0% | 0.3% | 0.9% | ±3.0% | 🔴 regression |
| `synthetic-256-ssr-esm (build)` | 5 | 2.07s | 2.35s | +13.5% | 0.3% | 0.3% | ±2.0% | 🔴 regression |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.47s | 2.71s | +9.8% | 1.0% | 0.8% | ±3.8% | 🔴 regression |
| `synthetic-48-ssr-esm (build)` | 5 | 1.36s | 1.34s | -1.7% | 1.5% | 1.0% | ±5.5% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 13.40s | 14.07s | +5.0% | 0.1% | 0.5% | ±2.0% | 🔴 regression |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.33s | 4.89s | +13.0% | 0.1% | 0.7% | ±2.2% | 🔴 regression |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.27s | 4.85s | +13.5% | 0.9% | 1.2% | ±4.3% | 🔴 regression |
| `synthetic-256-sourcemaps (dev)` | 5 | 1.94s | 2.19s | +12.6% | 1.2% | 0.2% | ±3.5% | 🔴 regression |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.81s | 2.04s | +12.7% | 0.7% | 0.9% | ±3.3% | 🔴 regression |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.78s | 2.02s | +13.8% | 1.1% | 0.7% | ±3.9% | 🔴 regression |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.92s | 0.91s | -1.1% | 0.7% | 1.0% | ±3.5% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 86.53s | 88.01s | +1.7% | 0.3% | 1.1% | ±3.5% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 71.91s | 74.01s | +2.9% | 0.3% | 0.4% | ±2.0% | 🔴 regression |
| `complex app (warm)` | 3 | 62.10s | 63.25s | +1.8% | 0.0% | 0.1% | ±2.0% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.45s | 30.98s | +8.9% | 17.86s | 20.22s | +13.2% | 3.80s | 3.83s | +0.7% | 2.56s | 2.46s | -3.8% | 0.92x |
| Large app | 1 | 13.40s | 14.07s | +5.0% | 7.37s | 7.98s | +8.3% | 1.80s | 1.86s | +3.1% | 1.47s | 1.40s | -5.1% | 0.95x |
| Standard fixtures | 6 | 15.06s | 16.90s | +12.3% | 10.49s | 12.23s | +16.6% | 2.00s | 1.97s | -1.5% | 1.09s | 1.06s | -2.1% | 0.89x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.46s | 8.94s | +5.6% | 8.95s | 9.03s | 0.95x | 1536 MB |
| `synthetic-1024-ssr-esm` | 3 | 3.95s | 4.76s | +20.5% | 4.74s | 4.82s | 0.83x | 713 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.23s | 5.98s | +14.4% | 5.97s | 5.99s | 0.87x | 844 MB |
| `synthetic-256-sourcemaps` | 5 | 2.21s | 2.45s | +11.0% | 2.44s | 2.48s | 0.90x | 480 MB |
| `synthetic-256-ssr-esm` | 5 | 2.07s | 2.35s | +13.5% | 2.34s | 2.37s | 0.88x | 440 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.47s | 2.71s | +9.8% | 2.71s | 2.74s | 0.91x | 466 MB |
| `synthetic-48-ssr-esm` | 5 | 1.36s | 1.34s | -1.7% | 1.34s | 1.38s | 1.02x | 295 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 13.40s | 14.07s | +5.0% | 7.37s | 7.98s | 1.80s | 1.86s | 1.47s | 1.40s | -5.1% | 14.07s | 14.14s | 0.95x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.33s | 4.89s | +13.0% | 2.99s | 3.51s | 0.57s | 0.55s | 0.33s | 0.33s | -0.1% | 4.91s | 4.99s | 0.89x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.27s | 4.85s | +13.5% | 2.95s | 3.50s | 0.56s | 0.56s | 0.33s | 0.33s | -0.7% | 4.92s | 5.11s | 0.88x | - |
| `synthetic-256-sourcemaps` | 5 | 1.94s | 2.19s | +12.6% | 1.40s | 1.63s | 0.25s | 0.25s | 0.13s | 0.13s | +0.5% | 2.19s | 2.23s | 0.89x | - |
| `synthetic-256-ssr-esm` | 5 | 1.81s | 2.04s | +12.7% | 1.27s | 1.49s | 0.25s | 0.25s | 0.13s | 0.13s | +0.2% | 2.04s | 2.06s | 0.89x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.78s | 2.02s | +13.8% | 1.24s | 1.46s | 0.25s | 0.25s | 0.13s | 0.11s | -17.0% | 2.01s | 2.04s | 0.88x | - |
| `synthetic-48-ssr-esm` | 5 | 0.92s | 0.91s | -1.1% | 0.65s | 0.64s | 0.13s | 0.12s | 0.05s | 0.05s | +0.5% | 0.90s | 0.92s | 1.01x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1039.3ms | 2879.3ms | +177.0% | - | 34.0ms | 21 |
| node | `route:module` | 1071 | 490.4ms | 978.9ms | +99.6% | - | 8.0ms | 30 |
| web | `route:client-entry` | 1071 | 261.5ms | 242.1ms | -7.4% | 242.1ms | 5.7ms | 6 |
| node | `manifest:transform` | 3 | 46.9ms | 56.7ms | +20.9% | 56.7ms | 19.8ms | 3 |
| web | `manifest:stage` | 6 | 8.7ms | 8.7ms | 0.0% | 8.7ms | 1.9ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1243.3ms | 2131.4ms | +71.4% | - | 29.0ms | 26 |
| node | `route:module` | 3078 | 547.8ms | 1053.0ms | +92.2% | - | 9.1ms | 27 |
| web | `route:client-entry` | 3078 | 383.1ms | 365.1ms | -4.7% | 365.1ms | 6.4ms | 6 |
| node | `manifest:transform` | 3 | 124.5ms | 120.5ms | -3.2% | 120.5ms | 41.4ms | 3 |
| node | `module:client-only-stub` | 3 | 44.4ms | 19.6ms | -55.9% | 19.6ms | 7.8ms | 3 |
| web | `manifest:stage` | 6 | 29.7ms | 38.9ms | +31.0% | 38.9ms | 7.4ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.1ms | -66.7% | 0.1ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1260.4ms | 2171.1ms | +72.3% | - | 42.3ms | 27 |
| node | `route:module` | 3078 | 555.3ms | 1035.2ms | +86.4% | - | 5.6ms | 24 |
| web | `route:client-entry` | 3078 | 363.9ms | 388.0ms | +6.6% | 388.0ms | 7.3ms | 6 |
| node | `module:client-only-stub` | 3 | 309.6ms | 46.6ms | -84.9% | 46.6ms | 35.6ms | 3 |
| node | `manifest:transform` | 3 | 138.0ms | 118.4ms | -14.2% | 118.4ms | 41.0ms | 3 |
| web | `manifest:stage` | 7 | 35.4ms | 41.5ms | +17.2% | 41.5ms | 7.6ms | 7 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 717.0ms | 1804.8ms | +151.7% | - | 22.3ms | 20 |
| node | `route:module` | 1290 | 313.0ms | 679.8ms | +117.2% | - | 7.5ms | 32 |
| web | `route:client-entry` | 1290 | 208.9ms | 203.5ms | -2.6% | 203.5ms | 4.8ms | 10 |
| node | `module:client-only-stub` | 5 | 204.5ms | 34.5ms | -83.1% | 34.5ms | 10.3ms | 5 |
| node | `manifest:transform` | 5 | 80.4ms | 83.0ms | +3.2% | 83.0ms | 19.6ms | 5 |
| web | `manifest:stage` | 10 | 11.2ms | 9.9ms | -11.6% | 9.9ms | 1.3ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 697.1ms | 1522.1ms | +118.3% | - | 16.9ms | 21 |
| node | `route:module` | 1290 | 272.9ms | 551.8ms | +102.2% | - | 4.3ms | 32 |
| web | `route:client-entry` | 1291 | 203.4ms | 216.6ms | +6.5% | 216.6ms | 6.3ms | 11 |
| node | `manifest:transform` | 5 | 70.2ms | 90.1ms | +28.3% | 90.1ms | 20.5ms | 5 |
| web | `manifest:stage` | 11 | 11.1ms | 11.1ms | 0.0% | 11.1ms | 1.4ms | 11 |
| node | `module:client-only-stub` | 5 | 10.2ms | 59.2ms | +480.4% | 59.2ms | 24.0ms | 5 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1293 | 671.2ms | 1511.8ms | +125.2% | - | 16.6ms | 23 |
| node | `route:module` | 1290 | 287.4ms | 544.2ms | +89.4% | - | 5.0ms | 35 |
| web | `route:client-entry` | 1293 | 202.8ms | 204.6ms | +0.9% | 204.6ms | 5.1ms | 13 |
| node | `manifest:transform` | 5 | 77.4ms | 69.3ms | -10.5% | 69.3ms | 17.0ms | 5 |
| node | `module:client-only-stub` | 5 | 23.6ms | 38.6ms | +63.6% | 38.6ms | 12.3ms | 5 |
| web | `manifest:stage` | 13 | 10.5ms | 12.8ms | +21.9% | 12.8ms | 1.3ms | 13 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 228.0ms | 203.3ms | -10.8% | - | 13.9ms | 10 |
| node | `route:module` | 250 | 86.6ms | 80.9ms | -6.6% | - | 0.6ms | 10 |
| web | `route:client-entry` | 250 | 59.9ms | 53.2ms | -11.2% | 53.2ms | 3.3ms | 10 |
| node | `module:client-only-stub` | 5 | 51.7ms | 40.5ms | -21.7% | 40.5ms | 10.3ms | 5 |
| node | `manifest:transform` | 5 | 24.5ms | 29.3ms | +19.6% | 29.3ms | 6.4ms | 5 |
| web | `manifest:stage` | 10 | 2.9ms | 2.6ms | -10.3% | 2.6ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 86.53s | 88.01s | +1.7% | 87.99s | - | 0.98x | - |
| complex app | 3 | 62.10s | 63.25s | +1.8% | 62.87s | - | 0.98x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 71.91s | 74.01s | +2.9% | 64.61s | 67.13s | 2.31s | 2.22s | 1.80s | 1.80s | +0.1% | 73.87s | - | 0.97x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/30320303997)

