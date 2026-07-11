<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `602ad5f` against base `b2edd38`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.92s | 8.92s | -0.1% | 0.2% | 0.5% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.30s | 4.21s | -2.0% | 0.9% | 0.4% | ±3.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.83s | 5.61s | -3.8% | 1.0% | 0.1% | ±3.0% | 🟢 improvement |
| `synthetic-256-sourcemaps (build)` | 5 | 2.32s | 2.27s | -2.2% | 1.2% | 1.4% | ±5.7% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.14s | 2.20s | +3.1% | 0.3% | 0.0% | ±2.0% | 🔴 regression |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.55s | 2.58s | +1.0% | 0.9% | 1.6% | ±5.4% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.37s | 1.41s | +2.8% | 0.2% | 0.7% | ±2.1% | 🔴 regression |
| `large-355-ssr-esm (dev)` | 3 | 15.98s | 15.96s | -0.1% | 0.7% | 0.1% | ±2.1% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.90s | 4.94s | +0.7% | 0.7% | 2.8% | ±8.6% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.96s | 4.83s | -2.6% | 0.9% | 0.7% | ±3.3% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.20s | 2.08s | -5.5% | 1.9% | 2.1% | ±8.4% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.88s | 1.85s | -1.8% | 1.1% | 0.7% | ±3.8% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.99s | 1.86s | -6.6% | 0.9% | 1.3% | ±4.6% | 🟢 improvement |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.96s | 0.93s | -3.6% | 1.5% | 0.5% | ±4.7% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 110.96s | 109.46s | -1.3% | 0.8% | 0.1% | ±2.5% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 94.22s | 94.40s | +0.2% | 0.6% | 0.2% | ±2.0% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 76.65s | 76.32s | -0.4% | 0.4% | 0.2% | ±2.0% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 32.88s | 32.45s | -1.3% | 20.16s | 19.87s | -1.5% | 4.13s | 4.06s | -1.6% | 3.08s | 2.95s | -4.2% | 1.01x |
| Large app | 1 | 15.98s | 15.96s | -0.1% | 8.53s | 8.47s | -0.7% | 2.04s | 2.03s | -0.5% | 1.79s | 1.79s | -0.1% | 1.00x |
| Standard fixtures | 6 | 16.90s | 16.49s | -2.4% | 11.64s | 11.40s | -2.0% | 2.09s | 2.03s | -2.8% | 1.29s | 1.16s | -9.8% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.92s | 8.92s | -0.1% | 8.90s | 8.96s | 1.00x | 1489 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.30s | 4.21s | -2.0% | 4.21s | 4.23s | 1.02x | 645 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.83s | 5.61s | -3.8% | 5.59s | 5.62s | 1.04x | 819 MB |
| `synthetic-256-sourcemaps` | 5 | 2.32s | 2.27s | -2.2% | 2.27s | 2.32s | 1.02x | 440 MB |
| `synthetic-256-ssr-esm` | 5 | 2.14s | 2.20s | +3.1% | 2.19s | 2.22s | 0.97x | 416 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.55s | 2.58s | +1.0% | 2.56s | 2.62s | 0.99x | 443 MB |
| `synthetic-48-ssr-esm` | 5 | 1.37s | 1.41s | +2.8% | 1.41s | 1.42s | 0.97x | 293 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 15.98s | 15.96s | -0.1% | 8.53s | 8.47s | 2.04s | 2.03s | 1.79s | 1.79s | -0.1% | 15.94s | 15.98s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.90s | 4.94s | +0.7% | 3.38s | 3.37s | 0.56s | 0.58s | 0.40s | 0.35s | -12.5% | 4.95s | 5.11s | 0.99x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.96s | 4.83s | -2.6% | 3.39s | 3.34s | 0.61s | 0.59s | 0.38s | 0.35s | -6.7% | 4.83s | 4.86s | 1.03x | - |
| `synthetic-256-sourcemaps` | 5 | 2.20s | 2.08s | -5.5% | 1.55s | 1.49s | 0.27s | 0.23s | 0.15s | 0.15s | +0.9% | 2.09s | 2.13s | 1.06x | - |
| `synthetic-256-ssr-esm` | 5 | 1.88s | 1.85s | -1.8% | 1.30s | 1.29s | 0.24s | 0.25s | 0.15s | 0.13s | -16.9% | 1.85s | 1.89s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.99s | 1.86s | -6.6% | 1.35s | 1.27s | 0.28s | 0.25s | 0.15s | 0.13s | -17.1% | 1.87s | 1.94s | 1.07x | - |
| `synthetic-48-ssr-esm` | 5 | 0.96s | 0.93s | -3.6% | 0.67s | 0.64s | 0.13s | 0.13s | 0.05s | 0.05s | -0.6% | 0.93s | 0.97s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1098.3ms | 1126.6ms | +2.6% | 1126.6ms | 12.3ms | 6 |
| node | `route:module` | 1071 | 580.7ms | 571.7ms | -1.5% | 571.7ms | 4.7ms | 6 |
| web | `route:client-entry` | 1071 | 273.1ms | 272.5ms | -0.2% | 272.5ms | 7.0ms | 6 |
| node | `manifest:transform` | 3 | 110.5ms | 59.7ms | -46.0% | 59.7ms | 21.3ms | 3 |
| web | `manifest:stage` | 9 | 12.2ms | 13.4ms | +9.8% | 13.4ms | 3.0ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1294.1ms | 1246.7ms | -3.7% | 1246.7ms | 20.5ms | 6 |
| node | `route:module` | 3078 | 567.1ms | 559.8ms | -1.3% | 559.8ms | 6.2ms | 6 |
| web | `route:client-entry` | 3078 | 402.7ms | 411.8ms | +2.3% | 411.8ms | 6.5ms | 6 |
| node | `manifest:transform` | 3 | 124.8ms | 135.2ms | +8.3% | 135.2ms | 46.1ms | 3 |
| web | `manifest:stage` | 9 | 50.6ms | 43.6ms | -13.8% | 43.6ms | 8.1ms | 9 |
| node | `module:client-only-stub` | 3 | 35.7ms | 59.6ms | +66.9% | 59.6ms | 32.0ms | 3 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1291.9ms | 1238.8ms | -4.1% | 1238.8ms | 16.9ms | 6 |
| node | `route:module` | 3078 | 584.3ms | 583.6ms | -0.1% | 583.6ms | 5.4ms | 6 |
| web | `route:client-entry` | 3078 | 412.5ms | 389.6ms | -5.6% | 389.6ms | 5.6ms | 6 |
| node | `module:client-only-stub` | 3 | 155.6ms | 98.1ms | -37.0% | 98.1ms | 82.0ms | 3 |
| node | `manifest:transform` | 3 | 127.7ms | 126.7ms | -0.8% | 126.7ms | 44.5ms | 3 |
| web | `manifest:stage` | 9 | 43.2ms | 43.5ms | +0.7% | 43.5ms | 8.0ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 713.8ms | 713.1ms | -0.1% | 713.1ms | 11.7ms | 10 |
| node | `route:module` | 1290 | 314.5ms | 302.4ms | -3.8% | 302.4ms | 4.0ms | 10 |
| web | `route:client-entry` | 1290 | 196.4ms | 210.6ms | +7.2% | 210.6ms | 4.8ms | 10 |
| node | `module:client-only-stub` | 5 | 149.4ms | 92.0ms | -38.4% | 92.0ms | 40.4ms | 5 |
| node | `manifest:transform` | 5 | 81.1ms | 79.9ms | -1.5% | 79.9ms | 18.1ms | 5 |
| web | `manifest:stage` | 16 | 17.5ms | 15.4ms | -12.0% | 15.4ms | 1.4ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 709.0ms | 736.8ms | +3.9% | 736.8ms | 21.2ms | 10 |
| node | `route:module` | 1290 | 289.6ms | 292.2ms | +0.9% | 292.2ms | 10.1ms | 10 |
| web | `route:client-entry` | 1290 | 217.6ms | 201.3ms | -7.5% | 201.3ms | 6.1ms | 10 |
| node | `manifest:transform` | 5 | 75.5ms | 82.2ms | +8.9% | 82.2ms | 24.0ms | 5 |
| node | `module:client-only-stub` | 5 | 74.6ms | 15.2ms | -79.6% | 15.2ms | 3.7ms | 5 |
| web | `manifest:stage` | 15 | 14.6ms | 14.4ms | -1.4% | 14.4ms | 1.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 725.1ms | 737.5ms | +1.7% | 737.5ms | 14.6ms | 11 |
| node | `route:module` | 1290 | 284.8ms | 281.8ms | -1.1% | 281.8ms | 4.7ms | 10 |
| web | `route:client-entry` | 1291 | 202.1ms | 209.9ms | +3.9% | 209.9ms | 5.7ms | 11 |
| node | `manifest:transform` | 5 | 90.2ms | 81.5ms | -9.6% | 81.5ms | 21.8ms | 5 |
| web | `manifest:stage` | 16 | 16.4ms | 15.2ms | -7.3% | 15.2ms | 1.4ms | 16 |
| node | `module:client-only-stub` | 5 | 12.4ms | 27.3ms | +120.2% | 27.3ms | 11.8ms | 5 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 243.6ms | 232.0ms | -4.8% | 232.0ms | 9.5ms | 10 |
| node | `route:module` | 250 | 86.0ms | 81.1ms | -5.7% | 81.1ms | 3.5ms | 10 |
| web | `route:client-entry` | 250 | 59.9ms | 61.3ms | +2.3% | 61.3ms | 3.6ms | 10 |
| node | `module:client-only-stub` | 5 | 39.3ms | 36.5ms | -7.1% | 36.5ms | 11.0ms | 5 |
| node | `manifest:transform` | 5 | 23.9ms | 21.5ms | -10.0% | 21.5ms | 5.9ms | 5 |
| web | `manifest:stage` | 15 | 3.7ms | 3.9ms | +5.4% | 3.9ms | 0.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 110.96s | 109.46s | -1.3% | 108.86s | - | 1.01x | - |
| complex app | 3 | 76.65s | 76.32s | -0.4% | 76.01s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 94.22s | 94.40s | +0.2% | 83.68s | 84.36s | 2.60s | 2.58s | 3.17s | 3.14s | -0.8% | 94.53s | - | 1.00x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29134043572)

