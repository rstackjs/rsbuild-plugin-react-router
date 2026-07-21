<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `4ae8053` against base `27ab2ce`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.19s | 8.28s | +1.1% | 0.1% | 0.8% | ±2.4% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 3.90s | 3.81s | -2.3% | 0.4% | 0.2% | ±2.0% | 🟢 improvement |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.22s | 5.15s | -1.3% | 0.4% | 0.4% | ±2.0% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (build)` | 5 | 2.20s | 2.18s | -0.7% | 0.5% | 0.7% | ±2.5% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.06s | 2.02s | -2.0% | 1.1% | 1.5% | ±5.5% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.45s | 2.42s | -1.4% | 0.4% | 0.4% | ±2.0% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.33s | 1.32s | -0.6% | 0.6% | 0.9% | ±3.2% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 15.38s | 13.34s | -13.2% | 1.6% | 0.6% | ±5.1% | 🟢 improvement |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.47s | 4.23s | -5.3% | 1.0% | 0.7% | ±3.6% | 🟢 improvement |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.44s | 4.23s | -4.8% | 0.6% | 0.8% | ±3.0% | 🟢 improvement |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.06s | 1.92s | -6.6% | 0.4% | 0.8% | ±2.6% | 🟢 improvement |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.83s | 1.72s | -6.1% | 1.0% | 1.1% | ±4.4% | 🟢 improvement |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.82s | 1.73s | -4.8% | 0.6% | 0.7% | ±2.7% | 🟢 improvement |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.93s | 0.89s | -5.2% | 0.4% | 0.6% | ±2.2% | 🟢 improvement |
| `complex app (cold)` | 3 | 112.59s | 118.84s | +5.6% | 0.6% | 0.1% | ±2.0% | 🔴 regression |
| `complex app (dev)` | 3 | 99.43s | 102.11s | +2.7% | 0.8% | 1.9% | ±5.9% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 77.44s | 86.81s | +12.1% | 0.0% | 3.9% | ±11.4% | 🔴 regression |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.93s | 28.06s | -9.3% | 18.57s | 17.60s | -5.2% | 3.81s | 3.73s | -2.1% | 2.69s | 2.47s | -8.0% | 1.10x |
| Large app | 1 | 15.38s | 13.34s | -13.2% | 7.82s | 7.34s | -6.2% | 1.83s | 1.85s | +0.8% | 1.60s | 1.41s | -11.8% | 1.15x |
| Standard fixtures | 6 | 15.56s | 14.72s | -5.4% | 10.75s | 10.26s | -4.6% | 1.98s | 1.88s | -4.9% | 1.09s | 1.06s | -2.5% | 1.06x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.19s | 8.28s | +1.1% | 8.26s | 8.35s | 0.99x | 1497 MB |
| `synthetic-1024-ssr-esm` | 3 | 3.90s | 3.81s | -2.3% | 3.84s | 3.89s | 1.02x | 644 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.22s | 5.15s | -1.3% | 5.16s | 5.20s | 1.01x | 804 MB |
| `synthetic-256-sourcemaps` | 5 | 2.20s | 2.18s | -0.7% | 2.19s | 2.21s | 1.01x | 447 MB |
| `synthetic-256-ssr-esm` | 5 | 2.06s | 2.02s | -2.0% | 2.03s | 2.07s | 1.02x | 407 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.45s | 2.42s | -1.4% | 2.43s | 2.46s | 1.01x | 448 MB |
| `synthetic-48-ssr-esm` | 5 | 1.33s | 1.32s | -0.6% | 1.32s | 1.34s | 1.01x | 288 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 15.38s | 13.34s | -13.2% | 7.82s | 7.34s | 1.83s | 1.85s | 1.60s | 1.41s | -11.8% | 13.33s | 13.42s | 1.15x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.47s | 4.23s | -5.3% | 3.04s | 2.93s | 0.57s | 0.52s | 0.33s | 0.30s | -7.3% | 4.22s | 4.26s | 1.06x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.44s | 4.23s | -4.8% | 3.05s | 2.92s | 0.56s | 0.52s | 0.33s | 0.33s | -0.0% | 4.23s | 4.26s | 1.05x | - |
| `synthetic-256-sourcemaps` | 5 | 2.06s | 1.92s | -6.6% | 1.48s | 1.39s | 0.25s | 0.22s | 0.13s | 0.13s | -0.4% | 1.92s | 1.96s | 1.07x | - |
| `synthetic-256-ssr-esm` | 5 | 1.83s | 1.72s | -6.1% | 1.28s | 1.19s | 0.25s | 0.24s | 0.13s | 0.13s | -2.3% | 1.72s | 1.75s | 1.07x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.82s | 1.73s | -4.8% | 1.26s | 1.21s | 0.23s | 0.25s | 0.13s | 0.13s | -0.1% | 1.73s | 1.75s | 1.05x | - |
| `synthetic-48-ssr-esm` | 5 | 0.93s | 0.89s | -5.2% | 0.65s | 0.62s | 0.12s | 0.13s | 0.05s | 0.05s | +0.5% | 0.89s | 0.91s | 1.06x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1035.5ms | 1059.2ms | +2.3% | 1059.2ms | 18.3ms | 6 |
| node | `route:module` | 1071 | 515.1ms | 502.6ms | -2.4% | 502.6ms | 11.8ms | 6 |
| web | `route:client-entry` | 1071 | 276.5ms | 251.4ms | -9.1% | 251.4ms | 5.2ms | 6 |
| node | `manifest:transform` | 3 | 71.6ms | 63.7ms | -11.0% | 63.7ms | 23.5ms | 3 |
| web | `manifest:stage` | 6 | 12.0ms | 11.5ms | -4.2% | 11.5ms | 4.7ms | 6 |
| web | `manifest:transform` | 3 | 0.2ms | 0.3ms | +50.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1186.2ms | 1198.8ms | +1.1% | 1198.8ms | 10.4ms | 6 |
| node | `route:module` | 3078 | 552.6ms | 588.3ms | +6.5% | 588.3ms | 5.1ms | 6 |
| web | `route:client-entry` | 3078 | 360.3ms | 388.2ms | +7.7% | 388.2ms | 6.5ms | 6 |
| node | `manifest:transform` | 3 | 118.4ms | 124.9ms | +5.5% | 124.9ms | 47.6ms | 3 |
| web | `manifest:stage` | 6 | 40.6ms | 31.0ms | -23.6% | 31.0ms | 9.0ms | 6 |
| node | `module:client-only-stub` | 3 | 35.3ms | 139.1ms | +294.1% | 139.1ms | 84.1ms | 3 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1209.5ms | 1198.5ms | -0.9% | 1198.5ms | 16.5ms | 6 |
| node | `route:module` | 3078 | 588.1ms | 550.9ms | -6.3% | 550.9ms | 6.0ms | 6 |
| node | `module:client-only-stub` | 3 | 367.4ms | 49.6ms | -86.5% | 49.6ms | 19.0ms | 3 |
| web | `route:client-entry` | 3078 | 356.9ms | 358.5ms | +0.4% | 358.5ms | 6.2ms | 6 |
| node | `manifest:transform` | 3 | 120.7ms | 120.4ms | -0.2% | 120.4ms | 42.1ms | 3 |
| web | `manifest:stage` | 6 | 42.7ms | 29.5ms | -30.9% | 29.5ms | 7.2ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 717.9ms | 709.5ms | -1.2% | 709.5ms | 10.8ms | 10 |
| node | `route:module` | 1290 | 299.8ms | 306.3ms | +2.2% | 306.3ms | 5.4ms | 10 |
| web | `route:client-entry` | 1290 | 198.4ms | 197.8ms | -0.3% | 197.8ms | 4.7ms | 10 |
| node | `module:client-only-stub` | 5 | 90.0ms | 59.1ms | -34.3% | 59.1ms | 17.7ms | 5 |
| node | `manifest:transform` | 5 | 69.5ms | 88.4ms | +27.2% | 88.4ms | 20.2ms | 5 |
| web | `manifest:stage` | 11 | 16.5ms | 13.2ms | -20.0% | 13.2ms | 2.9ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 709.8ms | 717.1ms | +1.0% | 717.1ms | 18.8ms | 11 |
| node | `route:module` | 1290 | 269.3ms | 277.2ms | +2.9% | 277.2ms | 4.2ms | 10 |
| web | `route:client-entry` | 1291 | 198.0ms | 209.7ms | +5.9% | 209.7ms | 5.3ms | 11 |
| node | `manifest:transform` | 5 | 82.9ms | 82.9ms | 0.0% | 82.9ms | 21.8ms | 5 |
| node | `module:client-only-stub` | 5 | 27.4ms | 63.7ms | +132.5% | 63.7ms | 22.7ms | 5 |
| web | `manifest:stage` | 11 | 14.7ms | 10.8ms | -26.5% | 10.8ms | 1.3ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 684.9ms | 706.2ms | +3.1% | 706.2ms | 19.5ms | 10 |
| node | `route:module` | 1290 | 275.4ms | 270.4ms | -1.8% | 270.4ms | 4.6ms | 10 |
| web | `route:client-entry` | 1290 | 186.4ms | 201.7ms | +8.2% | 201.7ms | 4.8ms | 10 |
| node | `manifest:transform` | 5 | 112.3ms | 97.3ms | -13.4% | 97.3ms | 22.9ms | 5 |
| node | `module:client-only-stub` | 5 | 58.0ms | 31.0ms | -46.6% | 31.0ms | 13.3ms | 5 |
| web | `manifest:stage` | 10 | 14.0ms | 10.2ms | -27.1% | 10.2ms | 1.5ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 237.9ms | 199.8ms | -16.0% | 199.8ms | 10.0ms | 10 |
| node | `route:module` | 250 | 83.5ms | 81.5ms | -2.4% | 81.5ms | 0.8ms | 10 |
| web | `route:client-entry` | 250 | 59.4ms | 52.3ms | -12.0% | 52.3ms | 3.4ms | 10 |
| node | `module:client-only-stub` | 5 | 44.7ms | 37.4ms | -16.3% | 37.4ms | 10.8ms | 5 |
| node | `manifest:transform` | 5 | 24.7ms | 30.2ms | +22.3% | 30.2ms | 6.3ms | 5 |
| web | `manifest:stage` | 10 | 3.6ms | 2.6ms | -27.8% | 2.6ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 112.59s | 118.84s | +5.6% | 121.81s | - | 0.95x | - |
| complex app | 3 | 77.44s | 86.81s | +12.1% | 86.29s | - | 0.89x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 99.43s | 102.11s | +2.7% | 87.45s | 91.91s | 2.69s | 3.02s | 3.27s | 2.60s | -20.7% | 101.85s | - | 0.97x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29869735266)

