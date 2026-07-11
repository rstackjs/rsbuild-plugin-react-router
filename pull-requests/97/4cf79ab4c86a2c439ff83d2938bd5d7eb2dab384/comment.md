<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `4cf79ab` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.55s | 8.61s | +0.7% | 0.5% | 0.3% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.14s | 4.10s | -0.9% | 0.7% | 0.6% | ±2.7% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.58s | 6.05s | +8.3% | 0.8% | 0.2% | ±2.4% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.20s | 2.20s | +0.2% | 0.5% | 0.6% | ±2.2% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.14s | 2.06s | -3.5% | 0.3% | 0.4% | ±2.0% | 🟢 improvement |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.51s | 2.56s | +1.8% | 1.1% | 0.1% | ±3.3% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.37s | 1.35s | -1.5% | 0.5% | 0.4% | ±2.0% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 15.44s | 15.30s | -0.9% | 0.5% | 0.4% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.83s | 4.72s | -2.3% | 1.6% | 0.5% | ±4.8% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.77s | 4.70s | -1.3% | 1.2% | 0.4% | ±3.7% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.13s | 2.05s | -4.1% | 0.1% | 0.5% | ±2.0% | 🟢 improvement |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.90s | 1.83s | -3.4% | 2.2% | 1.3% | ±7.6% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.87s | 1.91s | +1.8% | 2.8% | 1.5% | ±9.4% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.96s | 0.92s | -4.3% | 1.0% | 0.7% | ±3.8% | 🟢 improvement |
| `complex app (cold)` | 3 | 114.73s | 112.90s | -1.6% | 0.8% | 0.9% | ±3.6% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 99.14s | 98.15s | -1.0% | 0.2% | 0.2% | ±2.0% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 77.82s | 78.76s | +1.2% | 0.5% | 0.2% | ±2.0% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.89s | 31.43s | -1.5% | 19.60s | 19.27s | -1.7% | 3.99s | 3.93s | -1.5% | 2.86s | 2.86s | +0.1% | 1.01x |
| Large app | 1 | 15.44s | 15.30s | -0.9% | 8.29s | 8.16s | -1.6% | 1.98s | 1.93s | -2.2% | 1.69s | 1.72s | +1.7% | 1.01x |
| Standard fixtures | 6 | 16.46s | 16.12s | -2.0% | 11.31s | 11.12s | -1.7% | 2.02s | 2.00s | -0.8% | 1.16s | 1.14s | -2.2% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.55s | 8.61s | +0.7% | 8.65s | 8.76s | 0.99x | 1489 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.14s | 4.10s | -0.9% | 4.09s | 4.13s | 1.01x | 627 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.58s | 6.05s | +8.3% | 6.08s | 6.17s | 0.92x | 887 MB |
| `synthetic-256-sourcemaps` | 5 | 2.20s | 2.20s | +0.2% | 2.20s | 2.22s | 1.00x | 441 MB |
| `synthetic-256-ssr-esm` | 5 | 2.14s | 2.06s | -3.5% | 2.06s | 2.08s | 1.04x | 425 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.51s | 2.56s | +1.8% | 2.54s | 2.56s | 0.98x | 450 MB |
| `synthetic-48-ssr-esm` | 5 | 1.37s | 1.35s | -1.5% | 1.35s | 1.35s | 1.02x | 298 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 15.44s | 15.30s | -0.9% | 8.29s | 8.16s | 1.98s | 1.93s | 1.69s | 1.72s | +1.7% | 15.31s | 15.39s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.83s | 4.72s | -2.3% | 3.25s | 3.27s | 0.58s | 0.53s | 0.35s | 0.35s | +0.3% | 4.71s | 4.74s | 1.02x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.77s | 4.70s | -1.3% | 3.32s | 3.25s | 0.57s | 0.58s | 0.35s | 0.33s | -6.8% | 4.68s | 4.72s | 1.01x | - |
| `synthetic-256-sourcemaps` | 5 | 2.13s | 2.05s | -4.1% | 1.49s | 1.46s | 0.25s | 0.25s | 0.13s | 0.15s | +18.3% | 2.05s | 2.10s | 1.04x | - |
| `synthetic-256-ssr-esm` | 5 | 1.90s | 1.83s | -3.4% | 1.30s | 1.25s | 0.25s | 0.25s | 0.13s | 0.13s | -1.4% | 1.85s | 1.89s | 1.03x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.87s | 1.91s | +1.8% | 1.30s | 1.28s | 0.24s | 0.26s | 0.15s | 0.13s | -16.3% | 1.90s | 2.01s | 0.98x | - |
| `synthetic-48-ssr-esm` | 5 | 0.96s | 0.92s | -4.3% | 0.66s | 0.61s | 0.13s | 0.13s | 0.05s | 0.05s | +0.3% | 0.92s | 0.96s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1085.4ms | 1046.7ms | -3.6% | 1046.7ms | 28.2ms | 6 |
| node | `route:module` | 1071 | 596.8ms | 524.0ms | -12.2% | 524.0ms | 9.4ms | 6 |
| web | `route:client-entry` | 1071 | 257.5ms | 243.7ms | -5.4% | 243.7ms | 5.0ms | 6 |
| node | `manifest:transform` | 3 | 70.6ms | 104.6ms | +48.2% | 104.6ms | 44.8ms | 3 |
| web | `manifest:stage` | 9 | 12.8ms | 12.1ms | -5.5% | 12.1ms | 2.2ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1239.1ms | 1258.7ms | +1.6% | 1258.7ms | 14.2ms | 6 |
| node | `route:module` | 3078 | 572.0ms | 551.0ms | -3.7% | 551.0ms | 5.8ms | 6 |
| web | `route:client-entry` | 3078 | 384.1ms | 407.8ms | +6.2% | 407.8ms | 6.6ms | 6 |
| node | `module:client-only-stub` | 3 | 339.7ms | 42.1ms | -87.6% | 42.1ms | 20.6ms | 3 |
| node | `manifest:transform` | 3 | 128.4ms | 123.3ms | -4.0% | 123.3ms | 45.3ms | 3 |
| web | `manifest:stage` | 9 | 40.4ms | 38.9ms | -3.7% | 38.9ms | 8.0ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1232.0ms | 1223.9ms | -0.7% | 1223.9ms | 20.4ms | 6 |
| node | `route:module` | 3078 | 532.2ms | 561.4ms | +5.5% | 561.4ms | 4.6ms | 6 |
| web | `route:client-entry` | 3078 | 371.9ms | 433.5ms | +16.6% | 433.5ms | 6.8ms | 6 |
| node | `manifest:transform` | 3 | 126.7ms | 120.2ms | -5.1% | 120.2ms | 43.9ms | 3 |
| node | `module:client-only-stub` | 3 | 51.1ms | 99.6ms | +94.9% | 99.6ms | 50.8ms | 3 |
| web | `manifest:stage` | 9 | 36.7ms | 35.3ms | -3.8% | 35.3ms | 6.4ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 705.1ms | 744.1ms | +5.5% | 744.1ms | 14.1ms | 10 |
| node | `route:module` | 1290 | 293.9ms | 308.1ms | +4.8% | 308.1ms | 4.6ms | 10 |
| web | `route:client-entry` | 1290 | 196.2ms | 214.9ms | +9.5% | 214.9ms | 6.0ms | 10 |
| node | `manifest:transform` | 5 | 76.9ms | 60.7ms | -21.1% | 60.7ms | 16.8ms | 5 |
| node | `module:client-only-stub` | 5 | 22.6ms | 99.9ms | +342.0% | 99.9ms | 75.4ms | 5 |
| web | `manifest:stage` | 15 | 19.2ms | 16.8ms | -12.5% | 16.8ms | 3.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 735.2ms | 728.1ms | -1.0% | 728.1ms | 17.6ms | 10 |
| node | `route:module` | 1290 | 272.0ms | 283.3ms | +4.2% | 283.3ms | 4.7ms | 10 |
| web | `route:client-entry` | 1290 | 202.6ms | 207.3ms | +2.3% | 207.3ms | 5.2ms | 10 |
| node | `manifest:transform` | 5 | 70.9ms | 78.2ms | +10.3% | 78.2ms | 17.8ms | 5 |
| web | `manifest:stage` | 15 | 15.9ms | 15.1ms | -5.0% | 15.1ms | 1.5ms | 15 |
| node | `module:client-only-stub` | 5 | 10.8ms | 38.8ms | +259.3% | 38.8ms | 28.0ms | 5 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 683.9ms | 745.6ms | +9.0% | 745.6ms | 17.9ms | 11 |
| node | `route:module` | 1290 | 284.5ms | 263.5ms | -7.4% | 263.5ms | 4.5ms | 10 |
| web | `route:client-entry` | 1291 | 201.7ms | 211.7ms | +5.0% | 211.7ms | 5.3ms | 11 |
| node | `manifest:transform` | 5 | 75.0ms | 79.7ms | +6.3% | 79.7ms | 21.0ms | 5 |
| node | `module:client-only-stub` | 5 | 60.1ms | 162.8ms | +170.9% | 162.8ms | 124.1ms | 5 |
| web | `manifest:stage` | 16 | 15.0ms | 15.8ms | +5.3% | 15.8ms | 2.2ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 225.3ms | 211.1ms | -6.3% | 211.1ms | 10.1ms | 10 |
| node | `route:module` | 250 | 85.3ms | 81.2ms | -4.8% | 81.2ms | 3.4ms | 10 |
| web | `route:client-entry` | 250 | 60.7ms | 64.6ms | +6.4% | 64.6ms | 3.6ms | 10 |
| node | `module:client-only-stub` | 5 | 36.1ms | 68.4ms | +89.5% | 68.4ms | 20.8ms | 5 |
| node | `manifest:transform` | 5 | 26.2ms | 26.9ms | +2.7% | 26.9ms | 6.4ms | 5 |
| web | `manifest:stage` | 15 | 3.7ms | 4.0ms | +8.1% | 4.0ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 114.73s | 112.90s | -1.6% | 112.72s | - | 1.02x | - |
| complex app | 3 | 77.82s | 78.76s | +1.2% | 79.07s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 99.14s | 98.15s | -1.0% | 88.23s | 87.30s | 2.84s | 2.89s | 3.29s | 3.37s | +2.2% | 98.23s | - | 1.01x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29137830278)

