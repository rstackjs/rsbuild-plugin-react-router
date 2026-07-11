<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `9afb901` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 9.01s | 8.98s | -0.3% | 0.9% | 0.6% | ±3.2% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.32s | 4.22s | -2.3% | 0.7% | 0.6% | ±2.6% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.64s | 6.22s | +10.3% | 0.3% | 1.4% | ±4.3% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.27s | 2.27s | +0.2% | 0.9% | 0.7% | ±3.4% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.17s | 2.14s | -1.3% | 0.4% | 0.2% | ±2.0% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.59s | 2.63s | +1.4% | 0.3% | 1.5% | ±4.5% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.41s | 1.41s | +0.2% | 0.4% | 1.5% | ±4.6% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 17.54s | 16.21s | -7.5% | 0.7% | 0.2% | ±2.0% | 🟢 improvement |
| `synthetic-1024-ssr-esm (dev)` | 3 | 5.06s | 4.95s | -2.0% | 3.2% | 0.1% | ±9.6% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.89s | 4.94s | +1.0% | 0.3% | 2.8% | ±8.4% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.18s | 2.14s | -1.6% | 1.2% | 1.0% | ±4.8% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.90s | 1.90s | -0.1% | 0.2% | 1.4% | ±4.1% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.91s | 1.90s | -0.5% | 0.8% | 0.4% | ±2.8% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.99s | 0.98s | -1.7% | 1.7% | 0.6% | ±5.4% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 93.17s | 92.51s | -0.7% | 0.1% | 0.6% | ±2.0% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 84.39s | 84.64s | +0.3% | 0.2% | 0.7% | ±2.2% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 62.96s | 65.32s | +3.7% | 0.1% | 1.4% | ±4.3% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 34.46s | 33.02s | -4.2% | 20.34s | 20.17s | -0.8% | 4.24s | 4.26s | +0.5% | 3.14s | 3.05s | -2.7% | 1.04x |
| Large app | 1 | 17.54s | 16.21s | -7.5% | 8.71s | 8.56s | -1.6% | 2.08s | 2.11s | +1.4% | 1.85s | 1.87s | +0.9% | 1.08x |
| Standard fixtures | 6 | 16.92s | 16.81s | -0.7% | 11.64s | 11.61s | -0.3% | 2.15s | 2.14s | -0.4% | 1.29s | 1.19s | -7.9% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 9.01s | 8.98s | -0.3% | 8.95s | 9.03s | 1.00x | 1501 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.32s | 4.22s | -2.3% | 4.23s | 4.28s | 1.02x | 639 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.64s | 6.22s | +10.3% | 6.26s | 6.41s | 0.91x | 888 MB |
| `synthetic-256-sourcemaps` | 5 | 2.27s | 2.27s | +0.2% | 2.27s | 2.29s | 1.00x | 440 MB |
| `synthetic-256-ssr-esm` | 5 | 2.17s | 2.14s | -1.3% | 2.13s | 2.15s | 1.01x | 415 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.59s | 2.63s | +1.4% | 2.65s | 2.71s | 0.99x | 470 MB |
| `synthetic-48-ssr-esm` | 5 | 1.41s | 1.41s | +0.2% | 1.41s | 1.43s | 1.00x | 291 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 17.54s | 16.21s | -7.5% | 8.71s | 8.56s | 2.08s | 2.11s | 1.85s | 1.87s | +0.9% | 16.58s | 17.33s | 1.08x | - |
| `synthetic-1024-ssr-esm` | 3 | 5.06s | 4.95s | -2.0% | 3.45s | 3.45s | 0.62s | 0.59s | 0.38s | 0.35s | -6.2% | 4.90s | 4.96s | 1.02x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.89s | 4.94s | +1.0% | 3.32s | 3.32s | 0.62s | 0.62s | 0.38s | 0.35s | -7.2% | 4.95s | 5.13s | 0.99x | - |
| `synthetic-256-sourcemaps` | 5 | 2.18s | 2.14s | -1.6% | 1.56s | 1.55s | 0.27s | 0.26s | 0.15s | 0.15s | -0.0% | 2.14s | 2.17s | 1.02x | - |
| `synthetic-256-ssr-esm` | 5 | 1.90s | 1.90s | -0.1% | 1.31s | 1.30s | 0.26s | 0.27s | 0.15s | 0.13s | -17.7% | 1.90s | 1.95s | 1.00x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.91s | 1.90s | -0.5% | 1.32s | 1.31s | 0.25s | 0.27s | 0.15s | 0.13s | -15.7% | 1.91s | 1.96s | 1.01x | - |
| `synthetic-48-ssr-esm` | 5 | 0.99s | 0.98s | -1.7% | 0.69s | 0.67s | 0.14s | 0.13s | 0.08s | 0.08s | +0.1% | 0.98s | 0.99s | 1.02x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1169.7ms | 1118.2ms | -4.4% | 1118.2ms | 14.8ms | 6 |
| node | `route:module` | 1071 | 537.8ms | 533.4ms | -0.8% | 533.4ms | 8.4ms | 6 |
| web | `route:client-entry` | 1071 | 263.5ms | 260.1ms | -1.3% | 260.1ms | 5.7ms | 6 |
| node | `manifest:transform` | 3 | 66.7ms | 71.4ms | +7.0% | 71.4ms | 34.8ms | 3 |
| web | `manifest:stage` | 9 | 12.8ms | 12.3ms | -3.9% | 12.3ms | 1.9ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1288.3ms | 1270.3ms | -1.4% | 1270.3ms | 17.7ms | 6 |
| node | `route:module` | 3078 | 571.0ms | 579.5ms | +1.5% | 579.5ms | 5.1ms | 6 |
| web | `route:client-entry` | 3078 | 383.5ms | 419.6ms | +9.4% | 419.6ms | 6.9ms | 6 |
| node | `manifest:transform` | 3 | 130.1ms | 130.4ms | +0.2% | 130.4ms | 45.0ms | 3 |
| node | `module:client-only-stub` | 3 | 65.0ms | 137.8ms | +112.0% | 137.8ms | 97.3ms | 3 |
| web | `manifest:stage` | 9 | 39.1ms | 37.9ms | -3.1% | 37.9ms | 6.9ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1250.6ms | 1267.9ms | +1.4% | 1267.9ms | 15.8ms | 6 |
| node | `route:module` | 3078 | 578.2ms | 574.2ms | -0.7% | 574.2ms | 6.4ms | 6 |
| web | `route:client-entry` | 3078 | 386.3ms | 399.3ms | +3.4% | 399.3ms | 7.5ms | 6 |
| node | `manifest:transform` | 3 | 152.9ms | 130.3ms | -14.8% | 130.3ms | 45.0ms | 3 |
| node | `module:client-only-stub` | 3 | 149.1ms | 77.7ms | -47.9% | 77.7ms | 32.0ms | 3 |
| web | `manifest:stage` | 9 | 43.4ms | 37.7ms | -13.1% | 37.7ms | 6.8ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 706.6ms | 795.4ms | +12.6% | 795.4ms | 23.5ms | 10 |
| node | `route:module` | 1290 | 312.4ms | 320.4ms | +2.6% | 320.4ms | 5.0ms | 10 |
| web | `route:client-entry` | 1290 | 217.6ms | 212.2ms | -2.5% | 212.2ms | 5.9ms | 10 |
| node | `manifest:transform` | 5 | 95.9ms | 82.9ms | -13.6% | 82.9ms | 18.6ms | 5 |
| node | `module:client-only-stub` | 5 | 70.7ms | 75.8ms | +7.2% | 75.8ms | 28.3ms | 5 |
| web | `manifest:stage` | 15 | 19.8ms | 15.2ms | -23.2% | 15.2ms | 1.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 706.6ms | 747.2ms | +5.7% | 747.2ms | 12.9ms | 10 |
| node | `route:module` | 1290 | 294.9ms | 292.6ms | -0.8% | 292.6ms | 9.2ms | 10 |
| web | `route:client-entry` | 1290 | 203.3ms | 206.7ms | +1.7% | 206.7ms | 5.7ms | 10 |
| node | `manifest:transform` | 5 | 82.7ms | 76.2ms | -7.9% | 76.2ms | 22.3ms | 5 |
| node | `module:client-only-stub` | 5 | 65.0ms | 91.9ms | +41.4% | 91.9ms | 67.7ms | 5 |
| web | `manifest:stage` | 15 | 15.0ms | 15.4ms | +2.7% | 15.4ms | 1.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 691.9ms | 744.2ms | +7.6% | 744.2ms | 16.3ms | 10 |
| node | `route:module` | 1290 | 289.4ms | 280.1ms | -3.2% | 280.1ms | 4.9ms | 10 |
| web | `route:client-entry` | 1290 | 207.1ms | 190.1ms | -8.2% | 190.1ms | 3.7ms | 10 |
| node | `manifest:transform` | 5 | 73.4ms | 89.5ms | +21.9% | 89.5ms | 22.2ms | 5 |
| node | `module:client-only-stub` | 5 | 68.5ms | 66.4ms | -3.1% | 66.4ms | 27.1ms | 5 |
| web | `manifest:stage` | 15 | 16.1ms | 15.4ms | -4.3% | 15.4ms | 1.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 279.0ms | 220.6ms | -20.9% | 220.6ms | 9.5ms | 10 |
| node | `route:module` | 250 | 93.8ms | 87.4ms | -6.8% | 87.4ms | 6.7ms | 10 |
| web | `route:client-entry` | 250 | 59.0ms | 59.2ms | +0.3% | 59.2ms | 3.8ms | 10 |
| node | `module:client-only-stub` | 5 | 57.7ms | 34.1ms | -40.9% | 34.1ms | 9.0ms | 5 |
| node | `manifest:transform` | 5 | 29.9ms | 29.3ms | -2.0% | 29.3ms | 8.3ms | 5 |
| web | `manifest:stage` | 15 | 3.9ms | 3.9ms | 0.0% | 3.9ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 93.17s | 92.51s | -0.7% | 93.27s | - | 1.01x | - |
| complex app | 3 | 62.96s | 65.32s | +3.7% | 65.14s | - | 0.96x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 84.39s | 84.64s | +0.3% | 74.79s | 74.97s | 2.12s | 2.13s | 3.60s | 3.65s | +1.4% | 83.77s | - | 1.00x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29168642971)

