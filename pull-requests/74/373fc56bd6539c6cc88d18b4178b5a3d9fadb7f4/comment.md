<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `373fc56` against base `94ed3cc`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.99s | 10.39s | +15.6% | 1.2% | 0.5% | ±3.9% | 🔴 regression |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.20s | 4.43s | +5.3% | 1.3% | 0.9% | ±4.7% | 🔴 regression |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.82s | 6.55s | +12.6% | 0.1% | 0.3% | ±2.0% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.12s | 2.15s | +1.3% | 1.2% | 0.6% | ±4.0% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 1.99s | 2.00s | +0.3% | 1.3% | 1.0% | ±4.8% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.35s | 2.46s | +4.6% | 0.4% | 0.9% | ±3.0% | 🔴 regression |
| `synthetic-48-ssr-esm (build)` | 5 | 1.33s | 1.32s | -0.2% | 2.9% | 0.2% | ±8.6% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 14.86s | 17.23s | +15.9% | 0.3% | 0.1% | ±2.0% | 🔴 regression |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.74s | 5.14s | +8.5% | 3.5% | 0.7% | ±10.5% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.69s | 5.15s | +9.8% | 0.3% | 0.4% | ±2.0% | 🔴 regression |
| `synthetic-256-sourcemaps (dev)` | 5 | 1.83s | 1.90s | +3.5% | 0.4% | 0.8% | ±2.6% | 🔴 regression |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.71s | 1.73s | +1.4% | 0.3% | 1.2% | ±3.7% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.69s | 1.75s | +3.5% | 0.6% | 1.3% | ±4.2% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.88s | 0.88s | -0.2% | 2.2% | 0.6% | ±6.7% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 121.01s | 115.92s | -4.2% | 2.7% | 0.2% | ±8.0% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 93.53s | 97.52s | +4.3% | 0.9% | 0.9% | ±3.7% | 🔴 regression |
| `complex app (warm)` | 3 | 78.06s | 91.35s | +17.0% | 0.8% | 3.4% | ±10.4% | 🔴 regression |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.41s | 33.79s | +11.1% | 18.94s | 22.65s | +19.6% | 4.09s | 3.97s | -3.1% | 2.76s | 2.68s | -2.8% | 0.90x |
| Large app | 1 | 14.86s | 17.23s | +15.9% | 8.15s | 10.44s | +28.0% | 2.03s | 2.03s | +0.1% | 1.62s | 1.72s | +5.7% | 0.86x |
| Standard fixtures | 6 | 15.55s | 16.56s | +6.5% | 10.79s | 12.21s | +13.2% | 2.06s | 1.93s | -6.2% | 1.13s | 0.97s | -14.9% | 0.94x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.99s | 10.39s | +15.6% | 10.40s | 10.45s | 0.87x | 1619 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.20s | 4.43s | +5.3% | 4.40s | 4.47s | 0.95x | 658 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.82s | 6.55s | +12.6% | 6.51s | 6.57s | 0.89x | 808 MB |
| `synthetic-256-sourcemaps` | 5 | 2.12s | 2.15s | +1.3% | 2.15s | 2.18s | 0.99x | 466 MB |
| `synthetic-256-ssr-esm` | 5 | 1.99s | 2.00s | +0.3% | 2.00s | 2.03s | 1.00x | 429 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.35s | 2.46s | +4.6% | 2.47s | 2.54s | 0.96x | 465 MB |
| `synthetic-48-ssr-esm` | 5 | 1.33s | 1.32s | -0.2% | 1.32s | 1.33s | 1.00x | 316 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 14.86s | 17.23s | +15.9% | 8.15s | 10.44s | 2.03s | 2.03s | 1.62s | 1.72s | +5.7% | 17.37s | 17.67s | 0.86x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.74s | 5.14s | +8.5% | 3.28s | 3.82s | 0.61s | 0.57s | 0.35s | 0.31s | -13.6% | 5.18s | 5.29s | 0.92x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.69s | 5.15s | +9.8% | 3.22s | 3.81s | 0.60s | 0.58s | 0.35s | 0.30s | -14.1% | 5.15s | 5.17s | 0.91x | - |
| `synthetic-256-sourcemaps` | 5 | 1.83s | 1.90s | +3.5% | 1.32s | 1.42s | 0.23s | 0.22s | 0.13s | 0.10s | -19.7% | 1.92s | 2.01s | 0.97x | - |
| `synthetic-256-ssr-esm` | 5 | 1.71s | 1.73s | +1.4% | 1.19s | 1.24s | 0.26s | 0.22s | 0.12s | 0.10s | -18.4% | 1.72s | 1.76s | 0.99x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.69s | 1.75s | +3.5% | 1.16s | 1.29s | 0.24s | 0.22s | 0.13s | 0.10s | -19.1% | 1.76s | 1.79s | 0.97x | - |
| `synthetic-48-ssr-esm` | 5 | 0.88s | 0.88s | -0.2% | 0.63s | 0.62s | 0.12s | 0.13s | 0.05s | 0.05s | +0.2% | 0.89s | 0.91s | 1.00x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1042.2ms | 942.0ms | -9.6% | 942.0ms | 13.9ms | 6 |
| node | `route:module` | 1071 | 518.5ms | 498.8ms | -3.8% | 498.8ms | 12.3ms | 6 |
| web | `route:client-entry` | 1071 | 279.3ms | 267.6ms | -4.2% | 267.6ms | 8.8ms | 6 |
| node | `manifest:transform` | 3 | 63.6ms | 61.9ms | -2.7% | 61.9ms | 22.7ms | 3 |
| web | `manifest:stage` | 6 | 8.8ms | 8.9ms | +1.1% | 8.9ms | 2.0ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 87.6ms | - | 87.6ms | 18.2ms | 6 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1244.1ms | 1092.4ms | -12.2% | 1092.4ms | 5.2ms | 6 |
| node | `route:module` | 3078 | 581.4ms | 574.6ms | -1.2% | 574.6ms | 14.9ms | 6 |
| web | `route:client-entry` | 3078 | 408.2ms | 349.9ms | -14.3% | 349.9ms | 7.9ms | 6 |
| node | `manifest:transform` | 3 | 119.3ms | 130.2ms | +9.1% | 130.2ms | 50.2ms | 3 |
| node | `module:client-only-stub` | 3 | 54.3ms | 158.2ms | +191.3% | 158.2ms | 69.8ms | 3 |
| web | `manifest:stage` | 6 | 35.2ms | 27.5ms | -21.9% | 27.5ms | 6.6ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.5ms | - | 1.5ms | 0.4ms | 6 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1263.8ms | 1126.2ms | -10.9% | 1126.2ms | 8.5ms | 6 |
| node | `route:module` | 3078 | 562.6ms | 575.5ms | +2.3% | 575.5ms | 16.3ms | 6 |
| web | `route:client-entry` | 3078 | 423.9ms | 371.1ms | -12.5% | 371.1ms | 7.0ms | 6 |
| node | `module:client-only-stub` | 3 | 184.3ms | 124.4ms | -32.5% | 124.4ms | 69.6ms | 3 |
| node | `manifest:transform` | 3 | 129.3ms | 160.8ms | +24.4% | 160.8ms | 76.8ms | 3 |
| web | `manifest:stage` | 6 | 28.7ms | 27.8ms | -3.1% | 27.8ms | 6.7ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.5ms | - | 1.5ms | 0.4ms | 6 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 708.2ms | 635.5ms | -10.3% | 635.5ms | 15.4ms | 11 |
| node | `route:module` | 1290 | 307.2ms | 305.9ms | -0.4% | 305.9ms | 6.2ms | 10 |
| web | `route:client-entry` | 1291 | 193.5ms | 188.0ms | -2.8% | 188.0ms | 5.9ms | 11 |
| node | `manifest:transform` | 5 | 79.6ms | 61.8ms | -22.4% | 61.8ms | 15.7ms | 5 |
| node | `module:client-only-stub` | 5 | 55.2ms | 13.3ms | -75.9% | 13.3ms | 4.3ms | 5 |
| web | `manifest:stage` | 12 | 10.4ms | 11.3ms | +8.7% | 11.3ms | 1.4ms | 12 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | - | 3.1ms | - | 3.1ms | 0.5ms | 11 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 669.5ms | 627.8ms | -6.2% | 627.8ms | 14.9ms | 10 |
| node | `route:module` | 1290 | 281.5ms | 273.0ms | -3.0% | 273.0ms | 5.1ms | 10 |
| web | `route:client-entry` | 1290 | 187.4ms | 185.8ms | -0.9% | 185.8ms | 5.6ms | 10 |
| node | `manifest:transform` | 5 | 79.9ms | 80.8ms | +1.1% | 80.8ms | 18.9ms | 5 |
| node | `module:client-only-stub` | 5 | 51.0ms | 11.2ms | -78.0% | 11.2ms | 3.0ms | 5 |
| web | `manifest:stage` | 11 | 11.7ms | 10.4ms | -11.1% | 10.4ms | 1.4ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | - | 2.2ms | - | 2.2ms | 0.4ms | 11 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1293 | 675.6ms | 609.7ms | -9.8% | 609.7ms | 15.4ms | 13 |
| node | `route:module` | 1290 | 285.8ms | 277.1ms | -3.0% | 277.1ms | 9.0ms | 10 |
| web | `route:client-entry` | 1293 | 190.0ms | 208.0ms | +9.5% | 208.0ms | 5.8ms | 13 |
| node | `module:client-only-stub` | 5 | 150.0ms | 28.5ms | -81.0% | 28.5ms | 17.0ms | 5 |
| node | `manifest:transform` | 5 | 64.0ms | 94.4ms | +47.5% | 94.4ms | 22.6ms | 5 |
| web | `manifest:stage` | 13 | 10.5ms | 11.7ms | +11.4% | 11.7ms | 1.4ms | 13 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.3ms | - | 2.3ms | 0.4ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 228.5ms | 230.2ms | +0.7% | 230.2ms | 8.0ms | 10 |
| node | `route:module` | 250 | 84.4ms | 77.0ms | -8.8% | 77.0ms | 3.7ms | 10 |
| web | `route:client-entry` | 250 | 65.5ms | 33.8ms | -48.4% | 33.8ms | 0.8ms | 10 |
| node | `module:client-only-stub` | 5 | 40.1ms | 31.4ms | -21.7% | 31.4ms | 8.0ms | 5 |
| node | `manifest:transform` | 5 | 25.3ms | 22.2ms | -12.3% | 22.2ms | 6.7ms | 5 |
| web | `manifest:stage` | 10 | 2.7ms | 2.8ms | +3.7% | 2.8ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.3ms | - | 2.3ms | 0.4ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 121.01s | 115.92s | -4.2% | 116.44s | - | 1.04x | - |
| complex app | 3 | 78.06s | 91.35s | +17.0% | 91.30s | - | 0.85x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 93.53s | 97.52s | +4.3% | 84.52s | 88.09s | 2.94s | 3.22s | 2.25s | 2.29s | +2.0% | 97.96s | - | 0.96x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/30309420410)

